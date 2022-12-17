use axum::{
    body::{self, Full},
    http::HeaderValue,
    response::{IntoResponse, Response},
};
use hyper::{header, Body, Request, StatusCode, Uri};
use include_dir::{include_dir, Dir};
use tracing::debug;

static STATIC_DIR: Dir<'_> = include_dir!("$CARGO_MANIFEST_DIR/public");

pub async fn proxy_frontend(uri: Uri) -> impl IntoResponse {
    let path = uri.path();
    let path = if path.starts_with("/assets/") {
        path
    } else {
        "/"
    };

    let dev_server_uri = Uri::builder()
        .scheme("http")
        .authority("localhost:3929")
        .path_and_query(path)
        .build()
        .unwrap();

    debug!("Proxying {} to {}", uri, dev_server_uri);

    let req = Request::builder()
        .uri(dev_server_uri)
        .body(Body::empty())
        .unwrap();
    let client = hyper::Client::new();
    client.request(req).await.unwrap()
}

pub async fn serve_static_path(path: &str) -> impl IntoResponse {
    let file = STATIC_DIR.get_file(path);

    let file = match file {
        Some(file) => file,
        None => STATIC_DIR.get_file("index.html").unwrap(),
    };

    let mime_type = mime_guess::from_path(file.path()).first_or_text_plain();
    debug!(
        "Request for {}: serving {} ({})",
        path,
        file.path().display(),
        mime_type
    );

    Response::builder()
        .status(StatusCode::OK)
        .header(
            header::CONTENT_TYPE,
            HeaderValue::from_str(mime_type.as_ref()).unwrap(),
        )
        .body(body::boxed(Full::from(file.contents())))
        .unwrap()
}

pub async fn serve_static(
    axum::extract::Path(path): axum::extract::Path<String>,
) -> impl IntoResponse {
    serve_static_path(path.trim_start_matches('/')).await
}

pub async fn serve_root() -> impl IntoResponse {
    serve_static_path("").await
}
