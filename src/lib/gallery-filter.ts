// Lets other sections on the home page open the gallery on a given category.
export const GALLERY_FILTER_EVENT = "apexwall:gallery-filter";

export function showGalleryCategory(category: string) {
  window.dispatchEvent(new CustomEvent<string>(GALLERY_FILTER_EVENT, { detail: category }));
  // scroll-margin-top on sections keeps the heading clear of the fixed navbar
  document.getElementById("gallery")?.scrollIntoView({ behavior: "smooth" });
}
