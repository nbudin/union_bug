use image::{
    imageops::{self, FilterType},
    DynamicImage, ImageFormat,
};

fn resize_crop(img: DynamicImage, width: u32, height: u32) -> DynamicImage {
    let mut img = img.resize_to_fill(width, height, FilterType::Lanczos3);
    let crop_x = (width - img.width()) / 2;
    let crop_y = (height - img.height()) / 2;
    img.crop(crop_x, crop_y, width, height)
}

fn main() {
    println!("Loading background image");
    let img = image::open(std::env::args().nth(1).unwrap()).unwrap();
    println!("Loading overlay");
    let overlay = image::open(std::env::args().nth(2).unwrap()).unwrap();

    println!("Resizing background image");
    let mut img = resize_crop(img, 1024, 1024);

    println!("Resizing overlay");
    let overlay = resize_crop(overlay, 1024, 1024);

    println!("Compositing images");
    imageops::overlay(&mut img, &overlay, 0, 0);

    println!("Saving PNG");
    img.save_with_format("./result.png", ImageFormat::Png)
        .unwrap();
}
