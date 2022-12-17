use axum::{
    body::{self, Empty, Full},
    http::HeaderValue,
    response::{IntoResponse, Response},
};
use hyper::{header, Body, Request, StatusCode, Uri};
use include_dir::{include_dir, Dir};
use tracing::debug;

static STATIC_DIR: Dir<'_> = include_dir!("$CARGO_MANIFEST_DIR/public");

pub async fn proxy_frontend(uri: Uri) -> impl IntoResponse {
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

pub async fn serve_static_path(path: &str) -> impl IntoResponse {
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

pub async fn serve_static(
    axum::extract::Path(path): axum::extract::Path<String>,
) -> impl IntoResponse {
    serve_static_path(path.trim_start_matches('/')).await
}

pub async fn serve_root() -> impl IntoResponse {
    serve_static_path("index.html").await
}
