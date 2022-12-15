mod assets;

use std::{
    io::{Cursor, Read},
    net::SocketAddr,
};

use assets::get_image;
use axum::{
    body::Body,
    extract::{DefaultBodyLimit, Multipart},
    http::{HeaderMap, HeaderValue, Request, Uri},
    response::IntoResponse,
    routing::post,
    Router,
};
use axum_macros::debug_handler;
use image::{
    imageops::{self, FilterType},
    DynamicImage, EncodableLayout, ImageFormat,
};
use serde::Deserialize;
use tower_http::{catch_panic::CatchPanicLayer, trace::TraceLayer};
use tracing::{debug, info};

use crate::assets::ImageAssetIdentity;

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
    println!("Resizing background image");
    let mut img = resize_crop(img.clone(), width, height);

    println!("Resizing overlay");
    let overlay = resize_crop(overlay.clone(), width, height);

    println!("Compositing images");
    imageops::overlay(&mut img, &overlay, 0, 0);

    img
}

#[derive(Deserialize)]
struct CompositeInput {}

#[debug_handler]
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
        let bytes: Vec<u8> = Vec::with_capacity(1024 * 1024); // 1MB will probably fit most images
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

async fn serve_frontend(uri: Uri) -> impl IntoResponse {
    let path = uri.path();
    let req = Request::builder()
        .uri(format!("http://localhost:3929{}", path))
        .body(Body::empty())
        .unwrap();
    let client = hyper::Client::new();
    client.request(req).await.unwrap()
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

    let app = Router::new()
        .route("/composite", post(composite))
        .fallback(serve_frontend)
        .layer(CatchPanicLayer::new())
        .layer(TraceLayer::new_for_http())
        .layer(DefaultBodyLimit::max(1024 * 1024 * 20)); // increase the size to 20MB

    let addr = SocketAddr::from(([0, 0, 0, 0], 3928));
    info!("listening on {}", addr);
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .with_graceful_shutdown(shutdown_signal())
        .await
        .unwrap();
}
