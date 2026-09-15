import ProductShowcase from "./ProductShowcase";

// The markup is sent with the initial response, so fast scrolling never finds
// an empty section.
export default function DeferredProductShowcase() {
  return (
    <div>
      <ProductShowcase />
    </div>
  );
}
