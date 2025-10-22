import { ImageList, ImageListItem } from '@mui/material';

interface Props {
  images: (string | null)[];
}

export const ImageGallery = ({ images = [] }: Props) => {
  return (
    <ImageList sx={{ width: '100%', height: 500 }} cols={4} rowHeight={200}>
      {images.map((image) => (
        <ImageListItem key={image}>
          <img
            srcSet={`${image}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
            src={`${image}?w=164&h=164&fit=crop&auto=format`}
            alt="Una imagen en la galería"
            loading="lazy"
          />
        </ImageListItem>
      ))}
    </ImageList>
  );
};
