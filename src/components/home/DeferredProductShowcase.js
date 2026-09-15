import ProductShowcase from "./ProductShowcase";

// The markup is sent with the initial response, so fast scrolling never finds
// an empty section. The browser can still skip off-screen paint and layout.
export default function DeferredProductShowcase() {
  return (
    <div className="landing-deferred-content">
      <ProductShowcase />
    </div>
  );
}
