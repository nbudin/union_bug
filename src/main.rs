mod assets;

use std::{
    io::{Cursor, Read},
    net::SocketAddr,
};

use assets::get_image;
use axum::{
    body::{self, Body, Empty, Full},
    extract::{DefaultBodyLimit, Multipart},
    http::{HeaderMap, HeaderValue, Request, Uri},
    response::{IntoResponse, Response},
    routing::{get, post},
    Router,
};
use hyper::{header, StatusCode};
use image::{
    imageops::{self, FilterType},
    DynamicImage, EncodableLayout, ImageFormat,
};
use include_dir::{include_dir, Dir};
use tower_http::{catch_panic::CatchPanicLayer, compression::CompressionLayer, trace::TraceLayer};
use tracing::{debug, info};

use crate::assets::ImageAssetIdentity;

static STATIC_DIR: Dir<'_> = include_dir!("$CARGO_MANIFEST_DIR/public");

fn resize_crop(img: DynamicImage, width: u32, height: u32) -> DynamicImage {
    let mut img = img.resize_to_fill(width, height, FilterType::Lanczos3);
    let crop_x = (width - img.width()) / 2;
    let crop_y = (height - img.height()) / 2;
    img.crop(crop_x, crop_y, width, height)
}

fn overlay_frame(
    img: &DynamicImage,
    overlay: &DynamicImage,
    width: u32,
    height: u32,
) -> DynamicImage {
    debug!("Resizing background image");
    let mut img = resize_crop(img.clone(), width, height);

    debug!("Resizing overlay");
    let overlay = resize_crop(overlay.clone(), width, height);

    debug!("Compositing images");
    imageops::overlay(&mut img, &overlay, 0, 0);

    img
}

async fn composite(mut multipart: Multipart) -> impl IntoResponse {
    let mut img: Option<DynamicImage> = None;
    while let Some(field) = multipart.next_field().await.unwrap() {
        let name = field.name().unwrap().to_string();
        if name == "image" {
            debug!("Decoding uploaded image");
            let format = match field.content_type() {
                Some("image/png") => Some(ImageFormat::Png),
                _ => None,
            };

            let data = field.bytes().await.unwrap();

            if let Some(format) = format {
                img = Some(image::load_from_memory_with_format(data.as_bytes(), format).unwrap());
            } else {
                img = Some(image::load_from_memory(data.as_bytes()).unwrap());
            }
        }
    }

    if let Some(img) = img.as_ref() {
        let overlay = get_image(ImageAssetIdentity::ABTWUTopLeftTemplate);

        let result = overlay_frame(img, overlay, 1024, 1024);
        let bytes: Vec<u8> = Vec::with_capacity(1024 * 1024 * 2); // 2MB will probably fit most images
        let mut cursor = Cursor::new(bytes);
        result.write_to(&mut cursor, ImageFormat::Png).unwrap();

        cursor.set_position(0);
        let iter = cursor.bytes().map(|r| r.unwrap());
        let body = axum::body::Bytes::from_iter(iter);
        let mut headers = HeaderMap::new();
        headers.append("Content-Type", HeaderValue::from_str("image/png").unwrap());
        Ok((headers, body))
    } else {
        Err("No image found in request".to_string())
    }
}

async fn proxy_frontend(uri: Uri) -> impl IntoResponse {
    let dev_server_uri = Uri::builder()
        .scheme("http")
        .authority("localhost:3929")
        .path_and_query(uri.path())
        .build()
        .unwrap();
    let req = Request::builder()
        .uri(dev_server_uri)
        .body(Body::empty())
        .unwrap();
    let client = hyper::Client::new();
    client.request(req).await.unwrap()
}

async fn serve_static_path(path: &str) -> impl IntoResponse {
    let mime_type = mime_guess::from_path(path).first_or_text_plain();

    debug!("Serving {} ({})", path, mime_type);

    match STATIC_DIR.get_file(path) {
        None => Response::builder()
            .status(StatusCode::NOT_FOUND)
            .body(body::boxed(Empty::new()))
            .unwrap(),
        Some(file) => Response::builder()
            .status(StatusCode::OK)
            .header(
                header::CONTENT_TYPE,
                HeaderValue::from_str(mime_type.as_ref()).unwrap(),
            )
            .body(body::boxed(Full::from(file.contents())))
            .unwrap(),
    }
}

async fn serve_static(axum::extract::Path(path): axum::extract::Path<String>) -> impl IntoResponse {
    serve_static_path(path.trim_start_matches('/')).await
}

async fn serve_root() -> impl IntoResponse {
    serve_static_path("index.html").await
}

async fn shutdown_signal() {
    tokio::signal::ctrl_c()
        .await
        .expect("Expect shutdown signal handler");
    info!("Shutting down server");
}

#[tokio::main]
async fn main() {
    // initialize tracing
    tracing_subscriber::fmt::init();

    let webpack_dev_server = std::env::var("WEBPACK_DEV_SERVER").is_ok();

    let mut app = Router::new().route("/composite", post(composite));

    if webpack_dev_server {
        app = app.fallback(proxy_frontend);
    } else {
        app = app
            .route("/*path", get(serve_static))
            .route("/", get(serve_root));
    }

    let app = app
        .layer(CatchPanicLayer::new())
        .layer(TraceLayer::new_for_http())
        .layer(CompressionLayer::new())
        .layer(DefaultBodyLimit::max(1024 * 1024 * 20)); // increase the size to 20MB

    let addr = SocketAddr::from(([0, 0, 0, 0], 3928));
    info!("listening on {}", addr);
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .with_graceful_shutdown(shutdown_signal())
        .await
        .unwrap();
}
