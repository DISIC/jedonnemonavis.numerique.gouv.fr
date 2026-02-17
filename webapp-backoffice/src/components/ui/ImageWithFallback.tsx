import Image, { ImageProps } from 'next/image';
import React, { useEffect, useState } from 'react';

type ImageWithFallbackProps = ImageProps & {
	fallbackSrc: string;
};

const ImageWithFallback = (props: ImageWithFallbackProps) => {
	const { src, fallbackSrc, ...rest } = props;
	const [imgSrc, setImgSrc] = useState(src);

	useEffect(() => {
		setImgSrc(src);
	}, [src, fallbackSrc]);

	return (
		<Image
			{...rest}
			src={imgSrc}
			onError={() => {
				setImgSrc(fallbackSrc);
			}}
		/>
	);
};

export default ImageWithFallback;
