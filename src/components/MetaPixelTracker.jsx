import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { initMetaPixel, trackMetaPageView } from '../lib/metaPixel';

export default function MetaPixelTracker() {
  const location = useLocation();
  const firstRouteHandledRef = useRef(false);

  useEffect(() => {
    initMetaPixel();
  }, []);

  useEffect(() => {
    // Skip first route because base snippet already tracks initial PageView.
    if (!firstRouteHandledRef.current) {
      firstRouteHandledRef.current = true;
      return;
    }

    trackMetaPageView();
  }, [location.pathname, location.search]);

  return null;
}
