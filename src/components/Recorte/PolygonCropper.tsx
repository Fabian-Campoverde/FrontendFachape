import { useEffect, useState } from "react";
import PolygonCropperMobile from "./PolygonCropperMobile";
import PolygonCropperPrigin from "./PolygonCropperOrigin";

interface Props {
  imageUrl: string;
  open: boolean;
  onClose: () => void;
}

const PolygonCropper = ({ imageUrl, open, onClose }: Props) => {
  const [isMobile, setIsMobile] = useState(false);
  

  useEffect(() => {
  const handleResize = () => {
    const isNowMobile = window.matchMedia("(max-width: 767px)").matches;
    
    setIsMobile(isNowMobile);
  };

  handleResize();

  window.addEventListener("resize", handleResize);

  return () => {
    window.removeEventListener("resize", handleResize);
  };
}, []);


  return isMobile ? (
    <PolygonCropperMobile imageUrl={imageUrl} open={open} onClose={onClose} />
  ) : (
    <PolygonCropperMobile imageUrl={imageUrl} open={open} onClose={onClose} />
  );
};

export default PolygonCropper;
