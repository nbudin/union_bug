use image::DynamicImage;
use once_cell::sync::Lazy;

static ABTWU_TOP_LEFT_TEMPLATE: Lazy<DynamicImage> = Lazy::new(|| {
    image::load_from_memory(include_bytes!("../assets/abtwu_top_left_template.png")).unwrap()
});

pub enum ImageAssetIdentity {
    ABTWUTopLeftTemplate,
}

pub fn get_image(identity: ImageAssetIdentity) -> &'static DynamicImage {
    match identity {
        ImageAssetIdentity::ABTWUTopLeftTemplate => &ABTWU_TOP_LEFT_TEMPLATE,
    }
}
