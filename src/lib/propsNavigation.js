const DEFAULT_PROPS_HREF = "/props";

export const getPropsHref = (searchParams) => {
  const query = searchParams?.toString();
  return query ? `${DEFAULT_PROPS_HREF}?${query}` : DEFAULT_PROPS_HREF;
};

export const withPropsReturnHref = (destination, propsHref) =>
  `${destination}?returnTo=${encodeURIComponent(propsHref)}`;

export const getPropsReturnHref = (searchParams) => {
  const returnTo = searchParams?.get("returnTo");

  // Only allow an internal Props URL as a return destination.
  if (returnTo === DEFAULT_PROPS_HREF || returnTo?.startsWith("/props?")) {
    return returnTo;
  }

  return DEFAULT_PROPS_HREF;
};
