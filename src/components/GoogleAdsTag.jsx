import { useEffect } from 'react';
import { initGoogleAdsTag } from '../lib/googleAds';

export default function GoogleAdsTag() {
  useEffect(() => {
    initGoogleAdsTag();
  }, []);

  return null;
}
