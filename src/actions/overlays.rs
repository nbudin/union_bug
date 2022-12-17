use std::{
    collections::HashMap,
    io::Cursor,
    sync::{Arc, Mutex},
};

use axum::{extract::Path, http::HeaderValue, response::IntoResponse, Json};
use hyper::{HeaderMap, StatusCode};
use image::{imageops::FilterType, ImageFormat};
use maplit::hashmap;
use once_cell::{race::OnceBox, sync::Lazy};

use crate::assets::{OVERLAYS, OVERLAYS_BY_KEY};

type LazyInMemoryCache<T> = Lazy<Arc<Mutex<HashMap<String, OnceBox<T>>>>>;

static OVERLAY_THUMBNAILS: LazyInMemoryCache<Vec<u8>> =
    Lazy::new(|| Arc::new(Mutex::new(HashMap::with_capacity(OVERLAYS.len()))));

pub async fn overlay_index() -> impl IntoResponse {
    Json(
        OVERLAYS
            .iter()
            .map(|overlay| {
                hashmap! {
                    "key" => overlay.key,
                    "description" => overlay.description
                }
            })
            .collect::<Vec<_>>(),
    )
}

pub async fn overlay_show(Path(key): Path<String>) -> impl IntoResponse {
    let overlay = OVERLAYS_BY_KEY.get(key.as_str());

    match overlay {
        Some(overlay) => {
            let mut lock = OVERLAY_THUMBNAILS
                .lock()
                .map_err(|_err| StatusCode::INTERNAL_SERVER_ERROR)?;
            let entry = lock.entry(key);
            let once_box = entry.or_insert_with(OnceBox::new);

            let bytes = once_box.get_or_init(|| {
                let resized = overlay.image.resize(512, 512, FilterType::Lanczos3);
                let bytes: Vec<u8> = Vec::new();
                let mut cursor = Cursor::new(bytes);
                resized.write_to(&mut cursor, ImageFormat::Png).unwrap();
                Box::new(cursor.into_inner())
            });

            let iter = bytes.iter().copied();
            let body = axum::body::Bytes::from_iter(iter);
            let mut headers = HeaderMap::new();
            headers.append("Content-Type", HeaderValue::from_str("image/png").unwrap());
            Ok((headers, body))
        }
        None => Err(StatusCode::NOT_FOUND),
    }
}
