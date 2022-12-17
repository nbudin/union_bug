use image::{
    imageops::{self, FilterType},
    DynamicImage,
};
use tracing::debug;

pub fn resize_crop(img: DynamicImage, width: u32, height: u32) -> DynamicImage {
    let mut img = img.resize_to_fill(width, height, FilterType::Lanczos3);
    let crop_x = (width - img.width()) / 2;
    let crop_y = (height - img.height()) / 2;
    img.crop(crop_x, crop_y, width, height)
}

pub fn overlay_frame(
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

#[test]
fn test_resize_crop() {
    let img = image::DynamicImage::new_rgba8(200, 100);
    let expected_img = image::DynamicImage::new_rgba8(100, 100);
    assert_eq!(resize_crop(img, 100, 100), expected_img);
}

#[test]
fn test_overlay_frame() {
    let img = image::DynamicImage::new_rgba8(200, 100);
    let overlay = image::DynamicImage::new_rgba8(50, 50);
    let expected_img = image::DynamicImage::new_rgba8(100, 100);
    assert_eq!(overlay_frame(&img, &overlay, 100, 100), expected_img);
}
