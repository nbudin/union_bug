use std::collections::HashMap;

use image::DynamicImage;
use once_cell::sync::Lazy;

static AB1U_TOP_LEFT_TEMPLATE: Lazy<DynamicImage> = Lazy::new(|| {
    image::load_from_memory(include_bytes!("../assets/ab1u_top_left_template.png")).unwrap()
});
static ABTWU_TOP_LEFT_TEMPLATE: Lazy<DynamicImage> = Lazy::new(|| {
    image::load_from_memory(include_bytes!("../assets/abtwu_top_left_template.png")).unwrap()
});
static ABTWU_RED_TOP_LEFT_TEMPLATE: Lazy<DynamicImage> = Lazy::new(|| {
    image::load_from_memory(include_bytes!("../assets/abtwu_red_top_left_template.png")).unwrap()
});
static ABTWU_RED_FAIR_CONTRACT_NOW: Lazy<DynamicImage> = Lazy::new(|| {
    image::load_from_memory(include_bytes!("../assets/abtwu_red_fair_contract_now.png")).unwrap()
});

pub struct Overlay {
    pub key: &'static str,
    pub description: &'static str,
    pub image: &'static DynamicImage,
}

pub static OVERLAYS: Lazy<Vec<Overlay>> = Lazy::new(|| {
    vec![
        Overlay {
            key: "abtwu-top-left-template",
            description: "ActBlue Tech Workers Union top left banner",
            image: &ABTWU_TOP_LEFT_TEMPLATE,
        },
        Overlay {
            key: "abtwu-red-top-left-template",
            description: "ActBlue Tech Workers Union red top left banner",
            image: &ABTWU_RED_TOP_LEFT_TEMPLATE,
        },
        Overlay {
            key: "abtwu-red-fair-contract-now",
            description: "ActBlue Tech Workers Union red Fair Contract Now",
            image: &ABTWU_RED_FAIR_CONTRACT_NOW,
        },
        Overlay {
            key: "ab1u-top-left-template",
            description: "ActBlue Union top left banner",
            image: &AB1U_TOP_LEFT_TEMPLATE,
        },
    ]
});

pub static OVERLAYS_BY_KEY: Lazy<HashMap<&str, &Overlay>> = Lazy::new(|| {
    OVERLAYS
        .iter()
        .map(|overlay| (overlay.key, overlay))
        .collect()
});
