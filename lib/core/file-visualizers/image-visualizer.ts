namespace Animate {
    export class ImageVisualizer implements IPreviewFactory {
        private _maxPreviewSize: number;

        constructor() {
            this._maxPreviewSize = 200;
        }

        /**
         * Creates a thumbnail preview of the file
         * @param file
         */
        thumbnail( file: HatcheryServer.IFile ): Promise<HTMLCanvasElement> {

            if ( file.extension === 'image/jpeg' || file.extension === 'image/png' || file.extension === 'image/gif' || file.extension === 'image/bmp' || file.extension === 'image/jpg' ) {
                return new Promise<HTMLCanvasElement>(( resolve, reject ) => {
                    const size = this._maxPreviewSize;


                    // If no preview exists, lets create one
                    if ( !file.previewUrl || file.previewUrl.toString().trim() === '' ) {
                        const k = document.createDocumentFragment();
                        const img = document.createElement( 'img' );
                        k.appendChild( img );
                        img.crossOrigin = 'Anonymous';
                        img.src = file.url;
                        img.onload = function ( e ) {
                            // Resize the image
                            const canvas = document.createElement( 'canvas' );
                            let width = img.naturalWidth,
                                height = img.naturalHeight;

                            if ( width > height ) {
                                if ( width > size ) {
                                    height *= size / width;
                                    width = size;
                                }
                            }
                            else {
                                if ( height > size ) {
                                    width *= size / height;
                                    height = size;
                                }
                            }

                            canvas.width = width;
                            canvas.height = height;
                            canvas.getContext( '2d' ).drawImage( img, 0, 0, width, height );
                            canvas.toDataURL( 'image/png' );

                            // Once the image is loaded - we upload a preview of the image
                            resolve( canvas );
                        };
                    }
                });
            }

            return null;
        }

        /**
         * This function generates a React Element that is used to preview a file
         * @param file The file we are looking to preview
         * @returns If a React Element is returned is added in the File viewer preview
         */
        generate( file: HatcheryServer.IFile ): JSX.Element {
            if ( file.extension === 'image/jpeg' || file.extension === 'image/png' || file.extension === 'image/gif' || file.extension === 'image/bmp' || file.extension === 'image/jpg' ) {
                return React.createElement( ImagePreview, { src: file.url } as IImagePreviewProps );
            }

            return null;
        }
    }
}