use std::io::{Cursor, Read};

use axum::{extract::Multipart, http::HeaderValue, response::IntoResponse};
use hyper::HeaderMap;
use image::{DynamicImage, EncodableLayout, ImageFormat};
use tracing::debug;

use crate::{assets::OVERLAYS_BY_KEY, image_processing::overlay_frame};

pub async fn composite(mut multipart: Multipart) -> impl IntoResponse {
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
        let overlay = OVERLAYS_BY_KEY
            .get("abtwu-top-left-template")
            .unwrap()
            .image;

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
