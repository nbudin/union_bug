mod actions;
mod assets;
mod image_processing;

use std::net::SocketAddr;

use axum::{
    extract::DefaultBodyLimit,
    routing::{get, post},
    Router,
};

use tower_http::{catch_panic::CatchPanicLayer, compression::CompressionLayer, trace::TraceLayer};
use tracing::info;

use crate::actions::{
    composite, overlay_index, overlay_show, proxy_frontend, serve_root, serve_static,
};

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

    let mut app = Router::new()
        .route("/composite", post(composite))
        .route("/overlays", get(overlay_index))
        .route("/overlays/:key", get(overlay_show));

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
