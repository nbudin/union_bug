use image::{
    imageops::{self, FilterType},
    DynamicImage, ImageError, ImageFormat,
};

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

fn load_and_composite(
    image_path: &str,
    overlay_path: &str,
    width: u32,
    height: u32,
) -> Result<DynamicImage, ImageError> {
    println!("Loading background image");
    let img = image::open(image_path)?;
    println!("Loading overlay");
    let overlay = image::open(overlay_path)?;

    let img = overlay_frame(&img, &overlay, width, height);
    Ok(img)
}

fn main() {
    let img = load_and_composite(
        std::env::args().nth(1).unwrap().as_str(),
        std::env::args().nth(2).unwrap().as_str(),
        1024,
        1024,
    )
    .unwrap();

    println!("Saving PNG");
    img.save_with_format("./result.png", ImageFormat::Png)
        .unwrap();
}
