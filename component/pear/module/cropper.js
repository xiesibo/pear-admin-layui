/*!
 * Cropper v3.0.0
 */

layui.define(['jquery'], function (exports) {
    let $ = layui.jquery;
    $ = $ && $.hasOwnProperty('default') ? $['default'] : $;

    const DEFAULTS = {
        // Define the view mode of the cropper
        viewMode: 0, // 0, 1, 2, 3

        // Define the dragging mode of the cropper
        dragMode: 'crop', // 'crop', 'move' or 'none'

        // Define the aspect ratio of the crop box
        aspectRatio: NaN,

        // An object with the previous cropping result data
        data: null,

        // A selector for adding extra containers to preview
        preview: '',

        // Re-render the cropper when resize the window
        responsive: true,

        // Restore the cropped area after resize the window
        restore: true,

        // Check if the current image is a cross-origin image
        checkCrossOrigin: true,

        // Check the current image's Exif Orientation information
        checkOrientation: true,

        // Show the black modal
        modal: true,

        // Show the dashed lines for guiding
        guides: true,

        // Show the center indicator for guiding
        center: true,

        // Show the white modal to highlight the crop box
        highlight: true,

        // Show the grid background
        background: true,

        // Enable to crop the image automatically when initialize
        autoCrop: true,

        // Define the percentage of automatic cropping area when initializes
        autoCropArea: 0.8,

        // Enable to move the image
        movable: true,

        // Enable to rotate the image
        rotatable: true,

        // Enable to scale the image
        scalable: true,

        // Enable to zoom the image
        zoomable: true,

        // Enable to zoom the image by dragging touch
        zoomOnTouch: true,

        // Enable to zoom the image by wheeling mouse
        zoomOnWheel: true,

        // Define zoom ratio when zoom the image by wheeling mouse
        wheelZoomRatio: 0.1,

        // Enable to move the crop box
        cropBoxMovable: true,

        // Enable to resize the crop box
        cropBoxResizable: true,

        // Toggle drag mode between "crop" and "move" when click twice on the cropper
        toggleDragModeOnDblclick: true,

        // Size limitation
        minCanvasWidth: 0,
        minCanvasHeight: 0,
        minCropBoxWidth: 0,
        minCropBoxHeight: 0,
        minContainerWidth: 200,
        minContainerHeight: 100,

        // Shortcuts of events
        ready: null,
        cropstart: null,
        cropmove: null,
        cropend: null,
        crop: null,
        zoom: null
    };

    const TEMPLATE = '<div class="cropper-container">' + '<div class="cropper-wrap-box">' + '<div class="cropper-canvas"></div>' + '</div>' + '<div class="cropper-drag-box"></div>' + '<div class="cropper-crop-box">' + '<span class="cropper-view-box"></span>' + '<span class="cropper-dashed dashed-h"></span>' + '<span class="cropper-dashed dashed-v"></span>' + '<span class="cropper-center"></span>' + '<span class="cropper-face"></span>' + '<span class="cropper-line line-e" data-action="e"></span>' + '<span class="cropper-line line-n" data-action="n"></span>' + '<span class="cropper-line line-w" data-action="w"></span>' + '<span class="cropper-line line-s" data-action="s"></span>' + '<span class="cropper-point point-e" data-action="e"></span>' + '<span class="cropper-point point-n" data-action="n"></span>' + '<span class="cropper-point point-w" data-action="w"></span>' + '<span class="cropper-point point-s" data-action="s"></span>' + '<span class="cropper-point point-ne" data-action="ne"></span>' + '<span class="cropper-point point-nw" data-action="nw"></span>' + '<span class="cropper-point point-sw" data-action="sw"></span>' + '<span class="cropper-point point-se" data-action="se"></span>' + '</div>' + '</div>';

    const REGEXP_DATA_URL_HEAD = /^data:.*,/;
    const REGEXP_USERAGENT = /(Macintosh|iPhone|iPod|iPad).*AppleWebKit/i;
    const navigator = typeof window !== 'undefined' ? window.navigator : null;
    const IS_SAFARI_OR_UIWEBVIEW = navigator && REGEXP_USERAGENT.test(navigator.userAgent);
    const fromCharCode = String.fromCharCode;

    function isNumber(n) {
        return typeof n === 'number' && !isNaN(n);
    }

    function isUndefined(n) {
        return typeof n === 'undefined';
    }

    function toArray(obj, offset) {
        const args = [];

        // This is necessary for IE8
        if (isNumber(offset)) {
            args.push(offset);
        }

        return args.slice.apply(obj, args);
    }

    // Custom proxy to avoid jQuery's guid
    function proxy(fn, context) {
        let args = Array(_len > 2 ? _len - 2 : 0);
        let _key = 2;
        let _len = arguments.length;
        for (; _key < _len; _key++) {
            args[_key - 2] = arguments[_key];
        }

        return function () {
            let args2 = Array(_len2);
            let _len2 = arguments.length;
            let _key2 = 0;
            for (; _key2 < _len2; _key2++) {
                args2[_key2] = arguments[_key2];
            }

            return fn.apply(context, args.concat(toArray(args2)));
        };
    }

    function objectKeys(obj) {
        const keys = [];

        $.each(obj, function (key) {
            keys.push(key);
        });

        return keys;
    }

    function isCrossOriginURL(url) {
        const parts = url.match(/^(https?:)\/\/([^:/?#]+):?(\d*)/i);

        return parts && (parts[1] !== location.protocol || parts[2] !== location.hostname || parts[3] !== location.port);
    }

    function addTimestamp(url) {
        const timestamp = 'timestamp=' + new Date().getTime();

        return url + (url.indexOf('?') === -1 ? '?' : '&') + timestamp;
    }

    function getImageSize(image, callback) {
        // Modern browsers (ignore Safari, #120 & #509)
        if (image.naturalWidth && !IS_SAFARI_OR_UIWEBVIEW) {
            callback(image.naturalWidth, image.naturalHeight);
            return;
        }

        // IE8: Don't use `new Image()` here (#319)
        const newImage = document.createElement('img');

        newImage.onload = function load() {
            callback(this.width, this.height);
        };

        newImage.src = image.src;
    }

    function getTransform(options) {
        const transforms = [];
        const translateX = options.translateX;
        const translateY = options.translateY;
        const rotate = options.rotate;
        const scaleX = options.scaleX;
        const scaleY = options.scaleY;

        if (isNumber(translateX) && translateX !== 0) {
            transforms.push('translateX(' + translateX + 'px)');
        }

        if (isNumber(translateY) && translateY !== 0) {
            transforms.push('translateY(' + translateY + 'px)');
        }

        // Rotate should come first before scale to match orientation transform
        if (isNumber(rotate) && rotate !== 0) {
            transforms.push('rotate(' + rotate + 'deg)');
        }

        if (isNumber(scaleX) && scaleX !== 1) {
            transforms.push('scaleX(' + scaleX + ')');
        }

        if (isNumber(scaleY) && scaleY !== 1) {
            transforms.push('scaleY(' + scaleY + ')');
        }

        return transforms.length ? transforms.join(' ') : 'none';
    }

    function getRotatedSizes(data, isReversed) {
        const deg = Math.abs(data.degree) % 180;
        const arc = (deg > 90 ? 180 - deg : deg) * Math.PI / 180;
        const sinArc = Math.sin(arc);
        const cosArc = Math.cos(arc);
        const width = data.width;
        const height = data.height;
        const aspectRatio = data.aspectRatio;
        let newWidth = void 0;
        let newHeight = void 0;

        if (!isReversed) {
            newWidth = width * cosArc + height * sinArc;
            newHeight = width * sinArc + height * cosArc;
        } else {
            newWidth = width / (cosArc + sinArc / aspectRatio);
            newHeight = newWidth / aspectRatio;
        }

        return {
            width: newWidth,
            height: newHeight
        };
    }

    function getSourceCanvas(image, data, options) {
        const canvas = $('<canvas>')[0];
        const context = canvas.getContext('2d');
        let dstX = 0;
        let dstY = 0;
        const dstWidth = data.naturalWidth;
        const dstHeight = data.naturalHeight;
        const rotate = data.rotate;
        const scaleX = data.scaleX;
        const scaleY = data.scaleY;
        const scalable = isNumber(scaleX) && isNumber(scaleY) && (scaleX !== 1 || scaleY !== 1);
        const rotatable = isNumber(rotate) && rotate !== 0;
        const advanced = rotatable || scalable;
        let canvasWidth = dstWidth * Math.abs(scaleX || 1);
        let canvasHeight = dstHeight * Math.abs(scaleY || 1);
        let translateX = void 0;
        let translateY = void 0;
        let rotated = void 0;

        if (scalable) {
            translateX = canvasWidth / 2;
            translateY = canvasHeight / 2;
        }

        if (rotatable) {
            rotated = getRotatedSizes({
                width: canvasWidth,
                height: canvasHeight,
                degree: rotate
            });

            canvasWidth = rotated.width;
            canvasHeight = rotated.height;
            translateX = canvasWidth / 2;
            translateY = canvasHeight / 2;
        }

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        if (options.fillColor) {
            context.fillStyle = options.fillColor;
            context.fillRect(0, 0, canvasWidth, canvasHeight);
        }

        if (advanced) {
            dstX = -dstWidth / 2;
            dstY = -dstHeight / 2;

            context.save();
            context.translate(translateX, translateY);
        }

        // Rotate should come first before scale as in the "getTransform" function
        if (rotatable) {
            context.rotate(rotate * Math.PI / 180);
        }

        if (scalable) {
            context.scale(scaleX, scaleY);
        }

        context.imageSmoothingEnabled = !!options.imageSmoothingEnabled;

        if (options.imageSmoothingQuality) {
            context.imageSmoothingQuality = options.imageSmoothingQuality;
        }

        context.drawImage(image, Math.floor(dstX), Math.floor(dstY), Math.floor(dstWidth), Math.floor(dstHeight));

        if (advanced) {
            context.restore();
        }

        return canvas;
    }

    function getStringFromCharCode(dataView, start, length) {
        let str = '';
        let i = void 0;

        for (i = start, length += start; i < length; i += 1) {
            str += fromCharCode(dataView.getUint8(i));
        }

        return str;
    }

    function getOrientation(arrayBuffer) {
        const dataView = new DataView(arrayBuffer);
        let length = dataView.byteLength;
        let orientation = void 0;
        let exifIDCode = void 0;
        let tiffOffset = void 0;
        let firstIFDOffset = void 0;
        let littleEndian = void 0;
        let endianness = void 0;
        let app1Start = void 0;
        let ifdStart = void 0;
        let offset = void 0;
        let i = void 0;

        // Only handle JPEG image (start by 0xFFD8)
        if (dataView.getUint8(0) === 0xFF && dataView.getUint8(1) === 0xD8) {
            offset = 2;

            while (offset < length) {
                if (dataView.getUint8(offset) === 0xFF && dataView.getUint8(offset + 1) === 0xE1) {
                    app1Start = offset;
                    break;
                }

                offset += 1;
            }
        }

        if (app1Start) {
            exifIDCode = app1Start + 4;
            tiffOffset = app1Start + 10;

            if (getStringFromCharCode(dataView, exifIDCode, 4) === 'Exif') {
                endianness = dataView.getUint16(tiffOffset);
                littleEndian = endianness === 0x4949;

                if (littleEndian || endianness === 0x4D4D /* bigEndian */) {
                    if (dataView.getUint16(tiffOffset + 2, littleEndian) === 0x002A) {
                        firstIFDOffset = dataView.getUint32(tiffOffset + 4, littleEndian);

                        if (firstIFDOffset >= 0x00000008) {
                            ifdStart = tiffOffset + firstIFDOffset;
                        }
                    }
                }
            }
        }

        if (ifdStart) {
            length = dataView.getUint16(ifdStart, littleEndian);

            for (i = 0; i < length; i += 1) {
                offset = ifdStart + i * 12 + 2;

                if (dataView.getUint16(offset, littleEndian) === 0x0112 /* Orientation */) {
                    // 8 is the offset of the current tag's value
                    offset += 8;

                    // Get the original orientation value
                    orientation = dataView.getUint16(offset, littleEndian);

                    // Override the orientation with its default value for Safari (#120)
                    if (IS_SAFARI_OR_UIWEBVIEW) {
                        dataView.setUint16(offset, 1, littleEndian);
                    }

                    break;
                }
            }
        }

        return orientation;
    }

    function dataURLToArrayBuffer(dataURL) {
        const base64 = dataURL.replace(REGEXP_DATA_URL_HEAD, '');
        const binary = atob(base64);
        const length = binary.length;
        const arrayBuffer = new ArrayBuffer(length);
        const dataView = new Uint8Array(arrayBuffer);
        let i = void 0;

        for (i = 0; i < length; i += 1) {
            dataView[i] = binary.charCodeAt(i);
        }

        return arrayBuffer;
    }

    // Only available for JPEG image
    function arrayBufferToDataURL(arrayBuffer) {
        const dataView = new Uint8Array(arrayBuffer);
        const length = dataView.length;
        let base64 = '';
        let i = void 0;

        for (i = 0; i < length; i += 1) {
            base64 += fromCharCode(dataView[i]);
        }

        return 'data:image/jpeg;base64,' + btoa(base64);
    }

    const render = {
        render: function render() {
            const self = this;

            self.initContainer();
            self.initCanvas();
            self.initCropBox();

            self.renderCanvas();

            if (self.cropped) {
                self.renderCropBox();
            }
        },
        initContainer: function initContainer() {
            const self = this;
            const options = self.options;
            const $this = self.$element;
            const $container = self.$container;
            const $cropper = self.$cropper;
            const hidden = 'cropper-hidden';

            $cropper.addClass(hidden);
            $this.removeClass(hidden);

            $cropper.css(self.container = {
                width: Math.max($container.width(), Number(options.minContainerWidth) || 200),
                height: Math.max($container.height(), Number(options.minContainerHeight) || 100)
            });

            $this.addClass(hidden);
            $cropper.removeClass(hidden);
        },


        // Canvas (image wrapper)
        initCanvas: function initCanvas() {
            const self = this;
            const viewMode = self.options.viewMode;
            const container = self.container;
            const containerWidth = container.width;
            const containerHeight = container.height;
            const image = self.image;
            const imageNaturalWidth = image.naturalWidth;
            const imageNaturalHeight = image.naturalHeight;
            const is90Degree = Math.abs(image.rotate) % 180 === 90;
            const naturalWidth = is90Degree ? imageNaturalHeight : imageNaturalWidth;
            const naturalHeight = is90Degree ? imageNaturalWidth : imageNaturalHeight;
            const aspectRatio = naturalWidth / naturalHeight;
            let canvasWidth = containerWidth;
            let canvasHeight = containerHeight;

            if (containerHeight * aspectRatio > containerWidth) {
                if (viewMode === 3) {
                    canvasWidth = containerHeight * aspectRatio;
                } else {
                    canvasHeight = containerWidth / aspectRatio;
                }
            } else if (viewMode === 3) {
                canvasHeight = containerWidth / aspectRatio;
            } else {
                canvasWidth = containerHeight * aspectRatio;
            }

            const canvas = {
                naturalWidth: naturalWidth,
                naturalHeight: naturalHeight,
                aspectRatio: aspectRatio,
                width: canvasWidth,
                height: canvasHeight
            };

            canvas.left = (containerWidth - canvasWidth) / 2;
            canvas.top = (containerHeight - canvasHeight) / 2;
            canvas.oldLeft = canvas.left;
            canvas.oldTop = canvas.top;

            self.canvas = canvas;
            self.limited = viewMode === 1 || viewMode === 2;
            self.limitCanvas(true, true);
            self.initialImage = $.extend({}, image);
            self.initialCanvas = $.extend({}, canvas);
        },
        limitCanvas: function limitCanvas(isSizeLimited, isPositionLimited) {
            const self = this;
            const options = self.options;
            const viewMode = options.viewMode;
            const container = self.container;
            const containerWidth = container.width;
            const containerHeight = container.height;
            const canvas = self.canvas;
            const aspectRatio = canvas.aspectRatio;
            const cropBox = self.cropBox;
            const cropped = self.cropped && cropBox;

            if (isSizeLimited) {
                let minCanvasWidth = Number(options.minCanvasWidth) || 0;
                let minCanvasHeight = Number(options.minCanvasHeight) || 0;

                if (viewMode) {
                    if (viewMode > 1) {
                        minCanvasWidth = Math.max(minCanvasWidth, containerWidth);
                        minCanvasHeight = Math.max(minCanvasHeight, containerHeight);

                        if (viewMode === 3) {
                            if (minCanvasHeight * aspectRatio > minCanvasWidth) {
                                minCanvasWidth = minCanvasHeight * aspectRatio;
                            } else {
                                minCanvasHeight = minCanvasWidth / aspectRatio;
                            }
                        }
                    } else if (minCanvasWidth) {
                        minCanvasWidth = Math.max(minCanvasWidth, cropped ? cropBox.width : 0);
                    } else if (minCanvasHeight) {
                        minCanvasHeight = Math.max(minCanvasHeight, cropped ? cropBox.height : 0);
                    } else if (cropped) {
                        minCanvasWidth = cropBox.width;
                        minCanvasHeight = cropBox.height;

                        if (minCanvasHeight * aspectRatio > minCanvasWidth) {
                            minCanvasWidth = minCanvasHeight * aspectRatio;
                        } else {
                            minCanvasHeight = minCanvasWidth / aspectRatio;
                        }
                    }
                }

                if (minCanvasWidth && minCanvasHeight) {
                    if (minCanvasHeight * aspectRatio > minCanvasWidth) {
                        minCanvasHeight = minCanvasWidth / aspectRatio;
                    } else {
                        minCanvasWidth = minCanvasHeight * aspectRatio;
                    }
                } else if (minCanvasWidth) {
                    minCanvasHeight = minCanvasWidth / aspectRatio;
                } else if (minCanvasHeight) {
                    minCanvasWidth = minCanvasHeight * aspectRatio;
                }

                canvas.minWidth = minCanvasWidth;
                canvas.minHeight = minCanvasHeight;
                canvas.maxWidth = Infinity;
                canvas.maxHeight = Infinity;
            }

            if (isPositionLimited) {
                if (viewMode) {
                    const newCanvasLeft = containerWidth - canvas.width;
                    const newCanvasTop = containerHeight - canvas.height;

                    canvas.minLeft = Math.min(0, newCanvasLeft);
                    canvas.minTop = Math.min(0, newCanvasTop);
                    canvas.maxLeft = Math.max(0, newCanvasLeft);
                    canvas.maxTop = Math.max(0, newCanvasTop);

                    if (cropped && self.limited) {
                        canvas.minLeft = Math.min(cropBox.left, cropBox.left + cropBox.width - canvas.width);
                        canvas.minTop = Math.min(cropBox.top, cropBox.top + cropBox.height - canvas.height);
                        canvas.maxLeft = cropBox.left;
                        canvas.maxTop = cropBox.top;

                        if (viewMode === 2) {
                            if (canvas.width >= containerWidth) {
                                canvas.minLeft = Math.min(0, newCanvasLeft);
                                canvas.maxLeft = Math.max(0, newCanvasLeft);
                            }

                            if (canvas.height >= containerHeight) {
                                canvas.minTop = Math.min(0, newCanvasTop);
                                canvas.maxTop = Math.max(0, newCanvasTop);
                            }
                        }
                    }
                } else {
                    canvas.minLeft = -canvas.width;
                    canvas.minTop = -canvas.height;
                    canvas.maxLeft = containerWidth;
                    canvas.maxTop = containerHeight;
                }
            }
        },
        renderCanvas: function renderCanvas(isChanged) {
            const self = this;
            const canvas = self.canvas;
            const image = self.image;
            const rotate = image.rotate;
            const naturalWidth = image.naturalWidth;
            const naturalHeight = image.naturalHeight;

            if (self.rotated) {
                self.rotated = false;

                // Computes rotated sizes with image sizes
                const rotated = getRotatedSizes({
                    width: image.width,
                    height: image.height,
                    degree: rotate
                });
                const aspectRatio = rotated.width / rotated.height;
                const isSquareImage = image.aspectRatio === 1;

                if (isSquareImage || aspectRatio !== canvas.aspectRatio) {
                    canvas.left -= (rotated.width - canvas.width) / 2;
                    canvas.top -= (rotated.height - canvas.height) / 2;
                    canvas.width = rotated.width;
                    canvas.height = rotated.height;
                    canvas.aspectRatio = aspectRatio;
                    canvas.naturalWidth = naturalWidth;
                    canvas.naturalHeight = naturalHeight;

                    // Computes rotated sizes with natural image sizes
                    if (isSquareImage && rotate % 90 || rotate % 180) {
                        const rotated2 = getRotatedSizes({
                            width: naturalWidth,
                            height: naturalHeight,
                            degree: rotate
                        });

                        canvas.naturalWidth = rotated2.width;
                        canvas.naturalHeight = rotated2.height;
                    }

                    self.limitCanvas(true, false);
                }
            }

            if (canvas.width > canvas.maxWidth || canvas.width < canvas.minWidth) {
                canvas.left = canvas.oldLeft;
            }

            if (canvas.height > canvas.maxHeight || canvas.height < canvas.minHeight) {
                canvas.top = canvas.oldTop;
            }

            canvas.width = Math.min(Math.max(canvas.width, canvas.minWidth), canvas.maxWidth);
            canvas.height = Math.min(Math.max(canvas.height, canvas.minHeight), canvas.maxHeight);

            self.limitCanvas(false, true);

            canvas.left = Math.min(Math.max(canvas.left, canvas.minLeft), canvas.maxLeft);
            canvas.top = Math.min(Math.max(canvas.top, canvas.minTop), canvas.maxTop);
            canvas.oldLeft = canvas.left;
            canvas.oldTop = canvas.top;

            self.$canvas.css({
                width: canvas.width,
                height: canvas.height,
                transform: getTransform({
                    translateX: canvas.left,
                    translateY: canvas.top
                })
            });

            self.renderImage();

            if (self.cropped && self.limited) {
                self.limitCropBox(true, true);
            }

            if (isChanged) {
                self.output();
            }
        },
        renderImage: function renderImage(isChanged) {
            const self = this;
            const canvas = self.canvas;
            const image = self.image;
            let reversed = void 0;

            if (image.rotate) {
                reversed = getRotatedSizes({
                    width: canvas.width,
                    height: canvas.height,
                    degree: image.rotate,
                    aspectRatio: image.aspectRatio
                }, true);
            }

            $.extend(image, reversed ? {
                width: reversed.width,
                height: reversed.height,
                left: (canvas.width - reversed.width) / 2,
                top: (canvas.height - reversed.height) / 2
            } : {
                width: canvas.width,
                height: canvas.height,
                left: 0,
                top: 0
            });

            self.$clone.css({
                width: image.width,
                height: image.height,
                transform: getTransform($.extend({
                    translateX: image.left,
                    translateY: image.top
                }, image))
            });

            if (isChanged) {
                self.output();
            }
        },
        initCropBox: function initCropBox() {
            const self = this;
            const options = self.options;
            const canvas = self.canvas;
            const aspectRatio = options.aspectRatio;
            const autoCropArea = Number(options.autoCropArea) || 0.8;
            const cropBox = {
                width: canvas.width,
                height: canvas.height
            };

            if (aspectRatio) {
                if (canvas.height * aspectRatio > canvas.width) {
                    cropBox.height = cropBox.width / aspectRatio;
                } else {
                    cropBox.width = cropBox.height * aspectRatio;
                }
            }

            self.cropBox = cropBox;
            self.limitCropBox(true, true);

            // Initialize auto crop area
            cropBox.width = Math.min(Math.max(cropBox.width, cropBox.minWidth), cropBox.maxWidth);
            cropBox.height = Math.min(Math.max(cropBox.height, cropBox.minHeight), cropBox.maxHeight);

            // The width of auto crop area must large than "minWidth", and the height too. (#164)
            cropBox.width = Math.max(cropBox.minWidth, cropBox.width * autoCropArea);
            cropBox.height = Math.max(cropBox.minHeight, cropBox.height * autoCropArea);
            cropBox.left = canvas.left + (canvas.width - cropBox.width) / 2;
            cropBox.top = canvas.top + (canvas.height - cropBox.height) / 2;
            cropBox.oldLeft = cropBox.left;
            cropBox.oldTop = cropBox.top;

            self.initialCropBox = $.extend({}, cropBox);
        },
        limitCropBox: function limitCropBox(isSizeLimited, isPositionLimited) {
            const self = this;
            const options = self.options;
            const aspectRatio = options.aspectRatio;
            const container = self.container;
            const containerWidth = container.width;
            const containerHeight = container.height;
            const canvas = self.canvas;
            const cropBox = self.cropBox;
            const limited = self.limited;

            if (isSizeLimited) {
                let minCropBoxWidth = Number(options.minCropBoxWidth) || 0;
                let minCropBoxHeight = Number(options.minCropBoxHeight) || 0;
                let maxCropBoxWidth = Math.min(containerWidth, limited ? canvas.width : containerWidth);
                let maxCropBoxHeight = Math.min(containerHeight, limited ? canvas.height : containerHeight);

                // The min/maxCropBoxWidth/Height must be less than containerWidth/Height
                minCropBoxWidth = Math.min(minCropBoxWidth, containerWidth);
                minCropBoxHeight = Math.min(minCropBoxHeight, containerHeight);

                if (aspectRatio) {
                    if (minCropBoxWidth && minCropBoxHeight) {
                        if (minCropBoxHeight * aspectRatio > minCropBoxWidth) {
                            minCropBoxHeight = minCropBoxWidth / aspectRatio;
                        } else {
                            minCropBoxWidth = minCropBoxHeight * aspectRatio;
                        }
                    } else if (minCropBoxWidth) {
                        minCropBoxHeight = minCropBoxWidth / aspectRatio;
                    } else if (minCropBoxHeight) {
                        minCropBoxWidth = minCropBoxHeight * aspectRatio;
                    }

                    if (maxCropBoxHeight * aspectRatio > maxCropBoxWidth) {
                        maxCropBoxHeight = maxCropBoxWidth / aspectRatio;
                    } else {
                        maxCropBoxWidth = maxCropBoxHeight * aspectRatio;
                    }
                }

                // The minWidth/Height must be less than maxWidth/Height
                cropBox.minWidth = Math.min(minCropBoxWidth, maxCropBoxWidth);
                cropBox.minHeight = Math.min(minCropBoxHeight, maxCropBoxHeight);
                cropBox.maxWidth = maxCropBoxWidth;
                cropBox.maxHeight = maxCropBoxHeight;
            }

            if (isPositionLimited) {
                if (limited) {
                    cropBox.minLeft = Math.max(0, canvas.left);
                    cropBox.minTop = Math.max(0, canvas.top);
                    cropBox.maxLeft = Math.min(containerWidth, canvas.left + canvas.width) - cropBox.width;
                    cropBox.maxTop = Math.min(containerHeight, canvas.top + canvas.height) - cropBox.height;
                } else {
                    cropBox.minLeft = 0;
                    cropBox.minTop = 0;
                    cropBox.maxLeft = containerWidth - cropBox.width;
                    cropBox.maxTop = containerHeight - cropBox.height;
                }
            }
        },
        renderCropBox: function renderCropBox() {
            const self = this;
            const options = self.options;
            const container = self.container;
            const containerWidth = container.width;
            const containerHeight = container.height;
            const cropBox = self.cropBox;

            if (cropBox.width > cropBox.maxWidth || cropBox.width < cropBox.minWidth) {
                cropBox.left = cropBox.oldLeft;
            }

            if (cropBox.height > cropBox.maxHeight || cropBox.height < cropBox.minHeight) {
                cropBox.top = cropBox.oldTop;
            }

            cropBox.width = Math.min(Math.max(cropBox.width, cropBox.minWidth), cropBox.maxWidth);
            cropBox.height = Math.min(Math.max(cropBox.height, cropBox.minHeight), cropBox.maxHeight);

            self.limitCropBox(false, true);

            cropBox.left = Math.min(Math.max(cropBox.left, cropBox.minLeft), cropBox.maxLeft);
            cropBox.top = Math.min(Math.max(cropBox.top, cropBox.minTop), cropBox.maxTop);
            cropBox.oldLeft = cropBox.left;
            cropBox.oldTop = cropBox.top;

            if (options.movable && options.cropBoxMovable) {
                // Turn to move the canvas when the crop box is equal to the container
                self.$face.data('action', cropBox.width === containerWidth && cropBox.height === containerHeight ? 'move' : 'all');
            }

            self.$cropBox.css({
                width: cropBox.width,
                height: cropBox.height,
                transform: getTransform({
                    translateX: cropBox.left,
                    translateY: cropBox.top
                })
            });

            if (self.cropped && self.limited) {
                self.limitCanvas(true, true);
            }

            if (!self.disabled) {
                self.output();
            }
        },
        output: function output() {
            const self = this;

            self.preview();

            if (self.completed) {
                self.trigger('crop', self.getData());
            }
        }
    };

    const DATA_PREVIEW = 'preview';

    const preview = {
        initPreview: function initPreview() {
            const self = this;
            const crossOrigin = self.crossOrigin;
            const url = crossOrigin ? self.crossOriginUrl : self.url;
            const image = document.createElement('img');

            if (crossOrigin) {
                image.crossOrigin = crossOrigin;
            }

            image.src = url;

            const $clone2 = $(image);

            self.$preview = $(self.options.preview);
            self.$clone2 = $clone2;
            self.$viewBox.html($clone2);
            self.$preview.each(function (i, element) {
                const $this = $(element);
                const img = document.createElement('img');

                // Save the original size for recover
                $this.data(DATA_PREVIEW, {
                    width: $this.width(),
                    height: $this.height(),
                    html: $this.html()
                });

                if (crossOrigin) {
                    img.crossOrigin = crossOrigin;
                }

                img.src = url;

                /**
                 * Override img element styles
                 * Add `display:block` to avoid margin top issue
                 * Add `height:auto` to override `height` attribute on IE8
                 * (Occur only when margin-top <= -height)
                 */
                img.style.cssText = 'display:block;' + 'width:100%;' + 'height:auto;' + 'min-width:0!important;' + 'min-height:0!important;' + 'max-width:none!important;' + 'max-height:none!important;' + 'image-orientation:0deg!important;"';

                $this.html(img);
            });
        },
        resetPreview: function resetPreview() {
            this.$preview.each(function (i, element) {
                const $this = $(element);
                const data = $this.data(DATA_PREVIEW);

                $this.css({
                    width: data.width,
                    height: data.height
                }).html(data.html).removeData(DATA_PREVIEW);
            });
        },
        preview: function preview() {
            const self = this;
            const image = self.image;
            const canvas = self.canvas;
            const cropBox = self.cropBox;
            const cropBoxWidth = cropBox.width;
            const cropBoxHeight = cropBox.height;
            const width = image.width;
            const height = image.height;
            const left = cropBox.left - canvas.left - image.left;
            const top = cropBox.top - canvas.top - image.top;

            if (!self.cropped || self.disabled) {
                return;
            }

            self.$clone2.css({
                width: width,
                height: height,
                transform: getTransform($.extend({
                    translateX: -left,
                    translateY: -top
                }, image))
            });

            self.$preview.each(function (i, element) {
                const $this = $(element);
                const data = $this.data(DATA_PREVIEW);
                const originalWidth = data.width;
                const originalHeight = data.height;
                let newWidth = originalWidth;
                let newHeight = originalHeight;
                let ratio = 1;

                if (cropBoxWidth) {
                    ratio = originalWidth / cropBoxWidth;
                    newHeight = cropBoxHeight * ratio;
                }

                if (cropBoxHeight && newHeight > originalHeight) {
                    ratio = originalHeight / cropBoxHeight;
                    newWidth = cropBoxWidth * ratio;
                    newHeight = originalHeight;
                }

                $this.css({
                    width: newWidth,
                    height: newHeight
                }).find('img').css({
                    width: width * ratio,
                    height: height * ratio,
                    transform: getTransform($.extend({
                        translateX: -left * ratio,
                        translateY: -top * ratio
                    }, image))
                });
            });
        }
    };

    // Globals
    const PointerEvent = typeof window !== 'undefined' ? window.PointerEvent : null;

    // Events
    const EVENT_POINTER_DOWN = PointerEvent ? 'pointerdown' : 'touchstart mousedown';
    const EVENT_POINTER_MOVE = PointerEvent ? 'pointermove' : 'touchmove mousemove';
    const EVENT_POINTER_UP = PointerEvent ? ' pointerup pointercancel' : 'touchend touchcancel mouseup';
    const EVENT_WHEEL = 'wheel mousewheel DOMMouseScroll';
    const EVENT_DBLCLICK = 'dblclick';
    const EVENT_RESIZE = 'resize';
    const EVENT_CROP_START = 'cropstart';
    const EVENT_CROP_MOVE = 'cropmove';
    const EVENT_CROP_END = 'cropend';
    const EVENT_CROP = 'crop';
    const EVENT_ZOOM = 'zoom';

    const events = {
        bind: function bind() {
            const self = this;
            const options = self.options;
            const $this = self.$element;
            const $cropper = self.$cropper;

            if ($.isFunction(options.cropstart)) {
                $this.on(EVENT_CROP_START, options.cropstart);
            }

            if ($.isFunction(options.cropmove)) {
                $this.on(EVENT_CROP_MOVE, options.cropmove);
            }

            if ($.isFunction(options.cropend)) {
                $this.on(EVENT_CROP_END, options.cropend);
            }

            if ($.isFunction(options.crop)) {
                $this.on(EVENT_CROP, options.crop);
            }

            if ($.isFunction(options.zoom)) {
                $this.on(EVENT_ZOOM, options.zoom);
            }

            $cropper.on(EVENT_POINTER_DOWN, proxy(self.cropStart, this));

            if (options.zoomable && options.zoomOnWheel) {
                $cropper.on(EVENT_WHEEL, proxy(self.wheel, this));
            }

            if (options.toggleDragModeOnDblclick) {
                $cropper.on(EVENT_DBLCLICK, proxy(self.dblclick, this));
            }

            $(document).on(EVENT_POINTER_MOVE, self.onCropMove = proxy(self.cropMove, this)).on(EVENT_POINTER_UP, self.onCropEnd = proxy(self.cropEnd, this));

            if (options.responsive) {
                $(window).on(EVENT_RESIZE, self.onResize = proxy(self.resize, this));
            }
        },
        unbind: function unbind() {
            const self = this;
            const options = self.options;
            const $this = self.$element;
            const $cropper = self.$cropper;

            if ($.isFunction(options.cropstart)) {
                $this.off(EVENT_CROP_START, options.cropstart);
            }

            if ($.isFunction(options.cropmove)) {
                $this.off(EVENT_CROP_MOVE, options.cropmove);
            }

            if ($.isFunction(options.cropend)) {
                $this.off(EVENT_CROP_END, options.cropend);
            }

            if ($.isFunction(options.crop)) {
                $this.off(EVENT_CROP, options.crop);
            }

            if ($.isFunction(options.zoom)) {
                $this.off(EVENT_ZOOM, options.zoom);
            }

            $cropper.off(EVENT_POINTER_DOWN, self.cropStart);

            if (options.zoomable && options.zoomOnWheel) {
                $cropper.off(EVENT_WHEEL, self.wheel);
            }

            if (options.toggleDragModeOnDblclick) {
                $cropper.off(EVENT_DBLCLICK, self.dblclick);
            }

            $(document).off(EVENT_POINTER_MOVE, self.onCropMove).off(EVENT_POINTER_UP, self.onCropEnd);

            if (options.responsive) {
                $(window).off(EVENT_RESIZE, self.onResize);
            }
        }
    };

    const REGEXP_ACTIONS = /^(e|w|s|n|se|sw|ne|nw|all|crop|move|zoom)$/;

    function getPointer(_ref, endOnly) {
        const pageX = _ref.pageX,
            pageY = _ref.pageY;

        const end = {
            endX: pageX,
            endY: pageY
        };

        if (endOnly) {
            return end;
        }

        return $.extend({
            startX: pageX,
            startY: pageY
        }, end);
    }

    const handlers = {
        resize: function resize() {
            const self = this;
            const options = self.options;
            const $container = self.$container;
            const container = self.container;
            const minContainerWidth = Number(options.minContainerWidth) || 200;
            const minContainerHeight = Number(options.minContainerHeight) || 100;

            if (self.disabled || container.width === minContainerWidth || container.height === minContainerHeight) {
                return;
            }

            const ratio = $container.width() / container.width;

            // Resize when width changed or height changed
            if (ratio !== 1 || $container.height() !== container.height) {
                let canvasData = void 0;
                let cropBoxData = void 0;

                if (options.restore) {
                    canvasData = self.getCanvasData();
                    cropBoxData = self.getCropBoxData();
                }

                self.render();

                if (options.restore) {
                    self.setCanvasData($.each(canvasData, function (i, n) {
                        canvasData[i] = n * ratio;
                    }));
                    self.setCropBoxData($.each(cropBoxData, function (i, n) {
                        cropBoxData[i] = n * ratio;
                    }));
                }
            }
        },
        dblclick: function dblclick() {
            const self = this;

            if (self.disabled || self.options.dragMode === 'none') {
                return;
            }

            self.setDragMode(self.$dragBox.hasClass('cropper-crop') ? 'move' : 'crop');
        },
        wheel: function wheel(event) {
            const self = this;
            const e = event.originalEvent || event;
            const ratio = Number(self.options.wheelZoomRatio) || 0.1;

            if (self.disabled) {
                return;
            }

            event.preventDefault();

            // Limit wheel speed to prevent zoom too fast
            if (self.wheeling) {
                return;
            }

            self.wheeling = true;

            setTimeout(function () {
                self.wheeling = false;
            }, 50);

            let delta = 1;

            if (e.deltaY) {
                delta = e.deltaY > 0 ? 1 : -1;
            } else if (e.wheelDelta) {
                delta = -e.wheelDelta / 120;
            } else if (e.detail) {
                delta = e.detail > 0 ? 1 : -1;
            }

            self.zoom(-delta * ratio, event);
        },
        cropStart: function cropStart(e) {
            const self = this;

            if (self.disabled) {
                return;
            }

            const options = self.options;
            const pointers = self.pointers;
            const originalEvent = e.originalEvent;
            let action = void 0;

            if (originalEvent && originalEvent.changedTouches) {
                // Handle touch event
                $.each(originalEvent.changedTouches, function (i, touch) {
                    pointers[touch.identifier] = getPointer(touch);
                });
            } else {
                // Handle mouse event and pointer event
                pointers[originalEvent && originalEvent.pointerId || 0] = getPointer(originalEvent || e);
            }

            if (objectKeys(pointers).length > 1 && options.zoomable && options.zoomOnTouch) {
                action = 'zoom';
            } else {
                action = $(e.target).data('action');
            }

            if (!REGEXP_ACTIONS.test(action)) {
                return;
            }

            if (self.trigger('cropstart', {
                originalEvent: originalEvent,
                action: action
            }).isDefaultPrevented()) {
                return;
            }

            e.preventDefault();

            self.action = action;
            self.cropping = false;

            if (action === 'crop') {
                self.cropping = true;
                self.$dragBox.addClass('cropper-modal');
            }
        },
        cropMove: function cropMove(e) {
            const self = this;
            const action = self.action;

            if (self.disabled || !action) {
                return;
            }

            const pointers = self.pointers;
            const originalEvent = e.originalEvent;

            e.preventDefault();

            if (self.trigger('cropmove', {
                originalEvent: originalEvent,
                action: action
            }).isDefaultPrevented()) {
                return;
            }

            if (originalEvent && originalEvent.changedTouches) {
                $.each(originalEvent.changedTouches, function (i, touch) {
                    $.extend(pointers[touch.identifier], getPointer(touch, true));
                });
            } else {
                $.extend(pointers[originalEvent && originalEvent.pointerId || 0], getPointer(originalEvent || e, true));
            }

            self.change(e);
        },
        cropEnd: function cropEnd(e) {
            const self = this;

            if (self.disabled) {
                return;
            }

            const action = self.action;
            const pointers = self.pointers;
            const originalEvent = e.originalEvent;

            if (originalEvent && originalEvent.changedTouches) {
                $.each(originalEvent.changedTouches, function (i, touch) {
                    delete pointers[touch.identifier];
                });
            } else {
                delete pointers[originalEvent && originalEvent.pointerId || 0];
            }

            if (!action) {
                return;
            }

            e.preventDefault();

            if (!objectKeys(pointers).length) {
                self.action = '';
            }

            if (self.cropping) {
                self.cropping = false;
                self.$dragBox.toggleClass('cropper-modal', self.cropped && self.options.modal);
            }

            self.trigger('cropend', {
                originalEvent: originalEvent,
                action: action
            });
        }
    };

    // Actions
    const ACTION_EAST = 'e';
    const ACTION_WEST = 'w';
    const ACTION_SOUTH = 's';
    const ACTION_NORTH = 'n';
    const ACTION_SOUTH_EAST = 'se';
    const ACTION_SOUTH_WEST = 'sw';
    const ACTION_NORTH_EAST = 'ne';
    const ACTION_NORTH_WEST = 'nw';

    function getMaxZoomRatio(pointers) {
        const pointers2 = $.extend({}, pointers);
        const ratios = [];

        $.each(pointers, function (pointerId, pointer) {
            delete pointers2[pointerId];

            $.each(pointers2, function (pointerId2, pointer2) {
                const x1 = Math.abs(pointer.startX - pointer2.startX);
                const y1 = Math.abs(pointer.startY - pointer2.startY);
                const x2 = Math.abs(pointer.endX - pointer2.endX);
                const y2 = Math.abs(pointer.endY - pointer2.endY);
                const z1 = Math.sqrt(x1 * x1 + y1 * y1);
                const z2 = Math.sqrt(x2 * x2 + y2 * y2);
                const ratio = (z2 - z1) / z1;

                ratios.push(ratio);
            });
        });

        ratios.sort(function (a, b) {
            return Math.abs(a) < Math.abs(b);
        });

        return ratios[0];
    }

    const change = {
        change: function change(e) {
            const self = this;
            const options = self.options;
            const pointers = self.pointers;
            const pointer = pointers[objectKeys(pointers)[0]];
            const container = self.container;
            const canvas = self.canvas;
            const cropBox = self.cropBox;
            let action = self.action;
            let aspectRatio = options.aspectRatio;
            let width = cropBox.width;
            let height = cropBox.height;
            let left = cropBox.left;
            let top = cropBox.top;
            const right = left + width;
            const bottom = top + height;
            let minLeft = 0;
            let minTop = 0;
            let maxWidth = container.width;
            let maxHeight = container.height;
            let renderable = true;
            let offset = void 0;

            // Locking aspect ratio in "free mode" by holding shift key (#259)
            if (!aspectRatio && e.shiftKey) {
                aspectRatio = width && height ? width / height : 1;
            }

            if (self.limited) {
                minLeft = cropBox.minLeft;
                minTop = cropBox.minTop;
                maxWidth = minLeft + Math.min(container.width, canvas.width, canvas.left + canvas.width);
                maxHeight = minTop + Math.min(container.height, canvas.height, canvas.top + canvas.height);
            }

            const range = {
                x: pointer.endX - pointer.startX,
                y: pointer.endY - pointer.startY
            };

            switch (action) {
                // Move crop box
                case 'all':
                    left += range.x;
                    top += range.y;
                    break;

                // Resize crop box
                case ACTION_EAST:
                    if (range.x >= 0 && (right >= maxWidth || aspectRatio && (top <= minTop || bottom >= maxHeight))) {
                        renderable = false;
                        break;
                    }

                    if (right + range.x > maxWidth) {
                        range.x = maxWidth - right;
                    }

                    width += range.x;

                    if (aspectRatio) {
                        height = width / aspectRatio;
                        top -= range.x / aspectRatio / 2;
                    }

                    if (width < 0) {
                        action = ACTION_WEST;
                        width = 0;
                    }

                    break;

                case ACTION_NORTH:
                    if (range.y <= 0 && (top <= minTop || aspectRatio && (left <= minLeft || right >= maxWidth))) {
                        renderable = false;
                        break;
                    }

                    if (top + range.y < minTop) {
                        range.y = minTop - top;
                    }

                    height -= range.y;
                    top += range.y;

                    if (aspectRatio) {
                        width = height * aspectRatio;
                        left += range.y * aspectRatio / 2;
                    }

                    if (height < 0) {
                        action = ACTION_SOUTH;
                        height = 0;
                    }

                    break;

                case ACTION_WEST:
                    if (range.x <= 0 && (left <= minLeft || aspectRatio && (top <= minTop || bottom >= maxHeight))) {
                        renderable = false;
                        break;
                    }

                    if (left + range.x < minLeft) {
                        range.x = minLeft - left;
                    }

                    width -= range.x;
                    left += range.x;

                    if (aspectRatio) {
                        height = width / aspectRatio;
                        top += range.x / aspectRatio / 2;
                    }

                    if (width < 0) {
                        action = ACTION_EAST;
                        width = 0;
                    }

                    break;

                case ACTION_SOUTH:
                    if (range.y >= 0 && (bottom >= maxHeight || aspectRatio && (left <= minLeft || right >= maxWidth))) {
                        renderable = false;
                        break;
                    }

                    if (bottom + range.y > maxHeight) {
                        range.y = maxHeight - bottom;
                    }

                    height += range.y;

                    if (aspectRatio) {
                        width = height * aspectRatio;
                        left -= range.y * aspectRatio / 2;
                    }

                    if (height < 0) {
                        action = ACTION_NORTH;
                        height = 0;
                    }

                    break;

                case ACTION_NORTH_EAST:
                    if (aspectRatio) {
                        if (range.y <= 0 && (top <= minTop || right >= maxWidth)) {
                            renderable = false;
                            break;
                        }

                        height -= range.y;
                        top += range.y;
                        width = height * aspectRatio;
                    } else {
                        if (range.x >= 0) {
                            if (right < maxWidth) {
                                width += range.x;
                            } else if (range.y <= 0 && top <= minTop) {
                                renderable = false;
                            }
                        } else {
                            width += range.x;
                        }

                        if (range.y <= 0) {
                            if (top > minTop) {
                                height -= range.y;
                                top += range.y;
                            }
                        } else {
                            height -= range.y;
                            top += range.y;
                        }
                    }

                    if (width < 0 && height < 0) {
                        action = ACTION_SOUTH_WEST;
                        height = 0;
                        width = 0;
                    } else if (width < 0) {
                        action = ACTION_NORTH_WEST;
                        width = 0;
                    } else if (height < 0) {
                        action = ACTION_SOUTH_EAST;
                        height = 0;
                    }

                    break;

                case ACTION_NORTH_WEST:
                    if (aspectRatio) {
                        if (range.y <= 0 && (top <= minTop || left <= minLeft)) {
                            renderable = false;
                            break;
                        }

                        height -= range.y;
                        top += range.y;
                        width = height * aspectRatio;
                        left += range.y * aspectRatio;
                    } else {
                        if (range.x <= 0) {
                            if (left > minLeft) {
                                width -= range.x;
                                left += range.x;
                            } else if (range.y <= 0 && top <= minTop) {
                                renderable = false;
                            }
                        } else {
                            width -= range.x;
                            left += range.x;
                        }

                        if (range.y <= 0) {
                            if (top > minTop) {
                                height -= range.y;
                                top += range.y;
                            }
                        } else {
                            height -= range.y;
                            top += range.y;
                        }
                    }

                    if (width < 0 && height < 0) {
                        action = ACTION_SOUTH_EAST;
                        height = 0;
                        width = 0;
                    } else if (width < 0) {
                        action = ACTION_NORTH_EAST;
                        width = 0;
                    } else if (height < 0) {
                        action = ACTION_SOUTH_WEST;
                        height = 0;
                    }

                    break;

                case ACTION_SOUTH_WEST:
                    if (aspectRatio) {
                        if (range.x <= 0 && (left <= minLeft || bottom >= maxHeight)) {
                            renderable = false;
                            break;
                        }

                        width -= range.x;
                        left += range.x;
                        height = width / aspectRatio;
                    } else {
                        if (range.x <= 0) {
                            if (left > minLeft) {
                                width -= range.x;
                                left += range.x;
                            } else if (range.y >= 0 && bottom >= maxHeight) {
                                renderable = false;
                            }
                        } else {
                            width -= range.x;
                            left += range.x;
                        }

                        if (range.y >= 0) {
                            if (bottom < maxHeight) {
                                height += range.y;
                            }
                        } else {
                            height += range.y;
                        }
                    }

                    if (width < 0 && height < 0) {
                        action = ACTION_NORTH_EAST;
                        height = 0;
                        width = 0;
                    } else if (width < 0) {
                        action = ACTION_SOUTH_EAST;
                        width = 0;
                    } else if (height < 0) {
                        action = ACTION_NORTH_WEST;
                        height = 0;
                    }

                    break;

                case ACTION_SOUTH_EAST:
                    if (aspectRatio) {
                        if (range.x >= 0 && (right >= maxWidth || bottom >= maxHeight)) {
                            renderable = false;
                            break;
                        }

                        width += range.x;
                        height = width / aspectRatio;
                    } else {
                        if (range.x >= 0) {
                            if (right < maxWidth) {
                                width += range.x;
                            } else if (range.y >= 0 && bottom >= maxHeight) {
                                renderable = false;
                            }
                        } else {
                            width += range.x;
                        }

                        if (range.y >= 0) {
                            if (bottom < maxHeight) {
                                height += range.y;
                            }
                        } else {
                            height += range.y;
                        }
                    }

                    if (width < 0 && height < 0) {
                        action = ACTION_NORTH_WEST;
                        height = 0;
                        width = 0;
                    } else if (width < 0) {
                        action = ACTION_SOUTH_WEST;
                        width = 0;
                    } else if (height < 0) {
                        action = ACTION_NORTH_EAST;
                        height = 0;
                    }

                    break;

                // Move canvas
                case 'move':
                    self.move(range.x, range.y);
                    renderable = false;
                    break;

                // Zoom canvas
                case 'zoom':
                    self.zoom(getMaxZoomRatio(pointers), e.originalEvent);
                    renderable = false;
                    break;

                // Create crop box
                case 'crop':
                    if (!range.x || !range.y) {
                        renderable = false;
                        break;
                    }

                    offset = self.$cropper.offset();
                    left = pointer.startX - offset.left;
                    top = pointer.startY - offset.top;
                    width = cropBox.minWidth;
                    height = cropBox.minHeight;

                    if (range.x > 0) {
                        action = range.y > 0 ? ACTION_SOUTH_EAST : ACTION_NORTH_EAST;
                    } else if (range.x < 0) {
                        left -= width;
                        action = range.y > 0 ? ACTION_SOUTH_WEST : ACTION_NORTH_WEST;
                    }

                    if (range.y < 0) {
                        top -= height;
                    }

                    // Show the crop box if is hidden
                    if (!self.cropped) {
                        self.$cropBox.removeClass('cropper-hidden');
                        self.cropped = true;

                        if (self.limited) {
                            self.limitCropBox(true, true);
                        }
                    }

                    break;

                default:
            }

            if (renderable) {
                cropBox.width = width;
                cropBox.height = height;
                cropBox.left = left;
                cropBox.top = top;
                self.action = action;
                self.renderCropBox();
            }

            // Override
            $.each(pointers, function (i, p) {
                p.startX = p.endX;
                p.startY = p.endY;
            });
        }
    };

    function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length) ; i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

    function getPointersCenter(pointers) {
        let pageX = 0;
        let pageY = 0;
        let count = 0;

        $.each(pointers, function (i, _ref) {
            const startX = _ref.startX,
                startY = _ref.startY;

            pageX += startX;
            pageY += startY;
            count += 1;
        });

        pageX /= count;
        pageY /= count;

        return {
            pageX: pageX,
            pageY: pageY
        };
    }

    const methods = {
        // Show the crop box manually
        crop: function crop() {
            const self = this;

            if (!self.ready || self.disabled) {
                return;
            }

            if (!self.cropped) {
                self.cropped = true;
                self.limitCropBox(true, true);

                if (self.options.modal) {
                    self.$dragBox.addClass('cropper-modal');
                }

                self.$cropBox.removeClass('cropper-hidden');
            }

            self.setCropBoxData(self.initialCropBox);
        },


        // Reset the image and crop box to their initial states
        reset: function reset() {
            const self = this;

            if (!self.ready || self.disabled) {
                return;
            }

            self.image = $.extend({}, self.initialImage);
            self.canvas = $.extend({}, self.initialCanvas);
            self.cropBox = $.extend({}, self.initialCropBox);

            self.renderCanvas();

            if (self.cropped) {
                self.renderCropBox();
            }
        },


        // Clear the crop box
        clear: function clear() {
            const self = this;

            if (!self.cropped || self.disabled) {
                return;
            }

            $.extend(self.cropBox, {
                left: 0,
                top: 0,
                width: 0,
                height: 0
            });

            self.cropped = false;
            self.renderCropBox();

            self.limitCanvas(true, true);

            // Render canvas after crop box rendered
            self.renderCanvas();

            self.$dragBox.removeClass('cropper-modal');
            self.$cropBox.addClass('cropper-hidden');
        },


        /**
         * Replace the image's src and rebuild the cropper
         *
         * @param {String} url
         * @param {Boolean} onlyColorChanged (optional)
         */
        replace: function replace(url, onlyColorChanged) {
            const self = this;

            if (!self.disabled && url) {
                if (self.isImg) {
                    self.$element.attr('src', url);
                }

                if (onlyColorChanged) {
                    self.url = url;
                    self.$clone.attr('src', url);

                    if (self.ready) {
                        self.$preview.find('img').add(self.$clone2).attr('src', url);
                    }
                } else {
                    if (self.isImg) {
                        self.replaced = true;
                    }

                    // Clear previous data
                    self.options.data = null;
                    self.load(url);
                }
            }
        },


        // Enable (unfreeze) the cropper
        enable: function enable() {
            const self = this;

            if (self.ready) {
                self.disabled = false;
                self.$cropper.removeClass('cropper-disabled');
            }
        },


        // Disable (freeze) the cropper
        disable: function disable() {
            const self = this;

            if (self.ready) {
                self.disabled = true;
                self.$cropper.addClass('cropper-disabled');
            }
        },


        // Destroy the cropper and remove the instance from the image
        destroy: function destroy() {
            const self = this;
            const $this = self.$element;

            if (self.loaded) {
                if (self.isImg && self.replaced) {
                    $this.attr('src', self.originalUrl);
                }

                self.unbuild();
                $this.removeClass('cropper-hidden');
            } else if (self.isImg) {
                $this.off('load', self.start);
            } else if (self.$clone) {
                self.$clone.remove();
            }

            $this.removeData('cropper');
        },


        /**
         * Move the canvas with relative offsets
         *
         * @param {Number} offsetX
         * @param {Number} offsetY (optional)
         */
        move: function move(offsetX, offsetY) {
            const self = this;
            const canvas = self.canvas;

            self.moveTo(isUndefined(offsetX) ? offsetX : canvas.left + Number(offsetX), isUndefined(offsetY) ? offsetY : canvas.top + Number(offsetY));
        },


        /**
         * Move the canvas to an absolute point
         *
         * @param {Number} x
         * @param {Number} y (optional)
         */
        moveTo: function moveTo(x, y) {
            const self = this;
            const canvas = self.canvas;
            let changed = false;

            // If "y" is not present, its default value is "x"
            if (isUndefined(y)) {
                y = x;
            }

            x = Number(x);
            y = Number(y);

            if (self.ready && !self.disabled && self.options.movable) {
                if (isNumber(x)) {
                    canvas.left = x;
                    changed = true;
                }

                if (isNumber(y)) {
                    canvas.top = y;
                    changed = true;
                }

                if (changed) {
                    self.renderCanvas(true);
                }
            }
        },


        /**
         * Zoom the canvas with a relative ratio
         *
         * @param {Number} ratio
         * @param {jQuery Event} _event (private)
         */
        zoom: function zoom(ratio, _event) {
            const self = this;
            const canvas = self.canvas;

            ratio = Number(ratio);

            if (ratio < 0) {
                ratio = 1 / (1 - ratio);
            } else {
                ratio = 1 + ratio;
            }

            self.zoomTo(canvas.width * ratio / canvas.naturalWidth, _event);
        },


        /**
         * Zoom the canvas to an absolute ratio
         *
         * @param {Number} ratio
         * @param {jQuery Event} _event (private)
         */
        zoomTo: function zoomTo(ratio, _event) {
            const self = this;
            const options = self.options;
            const pointers = self.pointers;
            const canvas = self.canvas;
            const width = canvas.width;
            const height = canvas.height;
            const naturalWidth = canvas.naturalWidth;
            const naturalHeight = canvas.naturalHeight;

            ratio = Number(ratio);

            if (ratio >= 0 && self.ready && !self.disabled && options.zoomable) {
                const newWidth = naturalWidth * ratio;
                const newHeight = naturalHeight * ratio;
                let originalEvent = void 0;

                if (_event) {
                    originalEvent = _event.originalEvent;
                }

                if (self.trigger('zoom', {
                    originalEvent: originalEvent,
                    oldRatio: width / naturalWidth,
                    ratio: newWidth / naturalWidth
                }).isDefaultPrevented()) {
                    return;
                }

                if (originalEvent) {
                    var offset = self.$cropper.offset();
                    var center = pointers && objectKeys(pointers).length ? getPointersCenter(pointers) : {
                        pageX: _event.pageX || originalEvent.pageX || 0,
                        pageY: _event.pageY || originalEvent.pageY || 0
                    };

                    // Zoom from the triggering point of the event
                    canvas.left -= (newWidth - width) * ((center.pageX - offset.left - canvas.left) / width);
                    canvas.top -= (newHeight - height) * ((center.pageY - offset.top - canvas.top) / height);
                } else {
                    // Zoom from the center of the canvas
                    canvas.left -= (newWidth - width) / 2;
                    canvas.top -= (newHeight - height) / 2;
                }

                canvas.width = newWidth;
                canvas.height = newHeight;
                self.renderCanvas(true);
            }
        },


        /**
         * Rotate the canvas with a relative degree
         *
         * @param {Number} degree
         */
        rotate: function rotate(degree) {
            const self = this;

            self.rotateTo((self.image.rotate || 0) + Number(degree));
        },


        /**
         * Rotate the canvas to an absolute degree
         * https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function#rotate()
         *
         * @param {Number} degree
         */
        rotateTo: function rotateTo(degree) {
            const self = this;

            degree = Number(degree);

            if (isNumber(degree) && self.ready && !self.disabled && self.options.rotatable) {
                self.image.rotate = degree % 360;
                self.rotated = true;
                self.renderCanvas(true);
            }
        },


        /**
         * Scale the image
         * https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function#scale()
         *
         * @param {Number} scaleX
         * @param {Number} scaleY (optional)
         */
        scale: function scale(scaleX, scaleY) {
            const self = this;
            const image = self.image;
            let changed = false;

            // If "scaleY" is not present, its default value is "scaleX"
            if (isUndefined(scaleY)) {
                scaleY = scaleX;
            }

            scaleX = Number(scaleX);
            scaleY = Number(scaleY);

            if (self.ready && !self.disabled && self.options.scalable) {
                if (isNumber(scaleX)) {
                    image.scaleX = scaleX;
                    changed = true;
                }

                if (isNumber(scaleY)) {
                    image.scaleY = scaleY;
                    changed = true;
                }

                if (changed) {
                    self.renderImage(true);
                }
            }
        },


        /**
         * Scale the abscissa of the image
         *
         * @param {Number} scaleX
         */
        scaleX: function scaleX(_scaleX) {
            const self = this;
            const scaleY = self.image.scaleY;

            self.scale(_scaleX, isNumber(scaleY) ? scaleY : 1);
        },


        /**
         * Scale the ordinate of the image
         *
         * @param {Number} scaleY
         */
        scaleY: function scaleY(_scaleY) {
            const self = this;
            const scaleX = self.image.scaleX;

            self.scale(isNumber(scaleX) ? scaleX : 1, _scaleY);
        },


        /**
         * Get the cropped area position and size data (base on the original image)
         *
         * @param {Boolean} isRounded (optional)
         * @return {Object} data
         */
        getData: function getData(isRounded) {
            const self = this;
            const options = self.options;
            const image = self.image;
            const canvas = self.canvas;
            const cropBox = self.cropBox;
            let ratio = void 0;
            let data = void 0;

            if (self.ready && self.cropped) {
                data = {
                    x: cropBox.left - canvas.left,
                    y: cropBox.top - canvas.top,
                    width: cropBox.width,
                    height: cropBox.height
                };

                ratio = image.width / image.naturalWidth;

                $.each(data, function (i, n) {
                    n /= ratio;
                    data[i] = isRounded ? Math.round(n) : n;
                });
            } else {
                data = {
                    x: 0,
                    y: 0,
                    width: 0,
                    height: 0
                };
            }

            if (options.rotatable) {
                data.rotate = image.rotate || 0;
            }

            if (options.scalable) {
                data.scaleX = image.scaleX || 1;
                data.scaleY = image.scaleY || 1;
            }

            return data;
        },


        /**
         * Set the cropped area position and size with new data
         *
         * @param {Object} data
         */
        setData: function setData(data) {
            const self = this;
            const options = self.options;
            const image = self.image;
            const canvas = self.canvas;
            const cropBoxData = {};
            let rotated = void 0;
            let isScaled = void 0;
            let ratio = void 0;

            if ($.isFunction(data)) {
                data = data.call(self.element);
            }

            if (self.ready && !self.disabled && $.isPlainObject(data)) {
                if (options.rotatable) {
                    if (isNumber(data.rotate) && data.rotate !== image.rotate) {
                        image.rotate = data.rotate;
                        rotated = true;
                        self.rotated = rotated;
                    }
                }

                if (options.scalable) {
                    if (isNumber(data.scaleX) && data.scaleX !== image.scaleX) {
                        image.scaleX = data.scaleX;
                        isScaled = true;
                    }

                    if (isNumber(data.scaleY) && data.scaleY !== image.scaleY) {
                        image.scaleY = data.scaleY;
                        isScaled = true;
                    }
                }

                if (rotated) {
                    self.renderCanvas();
                } else if (isScaled) {
                    self.renderImage();
                }

                ratio = image.width / image.naturalWidth;

                if (isNumber(data.x)) {
                    cropBoxData.left = data.x * ratio + canvas.left;
                }

                if (isNumber(data.y)) {
                    cropBoxData.top = data.y * ratio + canvas.top;
                }

                if (isNumber(data.width)) {
                    cropBoxData.width = data.width * ratio;
                }

                if (isNumber(data.height)) {
                    cropBoxData.height = data.height * ratio;
                }

                self.setCropBoxData(cropBoxData);
            }
        },


        /**
         * Get the container size data
         *
         * @return {Object} data
         */
        getContainerData: function getContainerData() {
            return this.ready ? this.container : {};
        },


        /**
         * Get the image position and size data
         *
         * @return {Object} data
         */
        getImageData: function getImageData() {
            return this.loaded ? this.image : {};
        },


        /**
         * Get the canvas position and size data
         *
         * @return {Object} data
         */
        getCanvasData: function getCanvasData() {
            const self = this;
            const canvas = self.canvas;
            const data = {};

            if (self.ready) {
                $.each(['left', 'top', 'width', 'height', 'naturalWidth', 'naturalHeight'], function (i, n) {
                    data[n] = canvas[n];
                });
            }

            return data;
        },


        /**
         * Set the canvas position and size with new data
         *
         * @param {Object} data
         */
        setCanvasData: function setCanvasData(data) {
            const self = this;
            const canvas = self.canvas;
            const aspectRatio = canvas.aspectRatio;

            if ($.isFunction(data)) {
                data = data.call(self.$element);
            }

            if (self.ready && !self.disabled && $.isPlainObject(data)) {
                if (isNumber(data.left)) {
                    canvas.left = data.left;
                }

                if (isNumber(data.top)) {
                    canvas.top = data.top;
                }

                if (isNumber(data.width)) {
                    canvas.width = data.width;
                    canvas.height = data.width / aspectRatio;
                } else if (isNumber(data.height)) {
                    canvas.height = data.height;
                    canvas.width = data.height * aspectRatio;
                }

                self.renderCanvas(true);
            }
        },


        /**
         * Get the crop box position and size data
         *
         * @return {Object} data
         */
        getCropBoxData: function getCropBoxData() {
            const self = this;
            const cropBox = self.cropBox;

            return self.ready && self.cropped ? {
                left: cropBox.left,
                top: cropBox.top,
                width: cropBox.width,
                height: cropBox.height
            } : {};
        },


        /**
         * Set the crop box position and size with new data
         *
         * @param {Object} data
         */
        setCropBoxData: function setCropBoxData(data) {
            const self = this;
            const cropBox = self.cropBox;
            const aspectRatio = self.options.aspectRatio;
            let widthChanged = void 0;
            let heightChanged = void 0;

            if ($.isFunction(data)) {
                data = data.call(self.$element);
            }

            if (self.ready && self.cropped && !self.disabled && $.isPlainObject(data)) {
                if (isNumber(data.left)) {
                    cropBox.left = data.left;
                }

                if (isNumber(data.top)) {
                    cropBox.top = data.top;
                }

                if (isNumber(data.width) && data.width !== cropBox.width) {
                    widthChanged = true;
                    cropBox.width = data.width;
                }

                if (isNumber(data.height) && data.height !== cropBox.height) {
                    heightChanged = true;
                    cropBox.height = data.height;
                }

                if (aspectRatio) {
                    if (widthChanged) {
                        cropBox.height = cropBox.width / aspectRatio;
                    } else if (heightChanged) {
                        cropBox.width = cropBox.height * aspectRatio;
                    }
                }

                self.renderCropBox();
            }
        },


        /**
         * Get a canvas drawn the cropped image
         *
         * @param {Object} options (optional)
         * @return {HTMLCanvasElement} canvas
         */
        getCroppedCanvas: function getCroppedCanvas(options) {
            const self = this;

            if (!self.ready || !window.HTMLCanvasElement) {
                return null;
            }

            if (!$.isPlainObject(options)) {
                options = {};
            }

            if (!self.cropped) {
                return getSourceCanvas(self.$clone[0], self.image, options);
            }

            const data = self.getData();
            const originalWidth = data.width;
            const originalHeight = data.height;
            const aspectRatio = originalWidth / originalHeight;
            let scaledWidth = void 0;
            let scaledHeight = void 0;
            let scaledRatio = void 0;

            if ($.isPlainObject(options)) {
                scaledWidth = options.width;
                scaledHeight = options.height;

                if (scaledWidth) {
                    scaledHeight = scaledWidth / aspectRatio;
                    scaledRatio = scaledWidth / originalWidth;
                } else if (scaledHeight) {
                    scaledWidth = scaledHeight * aspectRatio;
                    scaledRatio = scaledHeight / originalHeight;
                }
            }

            // The canvas element will use `Math.Math.floor` on a float number, so Math.floor first
            const canvasWidth = Math.floor(scaledWidth || originalWidth);
            const canvasHeight = Math.floor(scaledHeight || originalHeight);

            const canvas = $('<canvas>')[0];
            const context = canvas.getContext('2d');

            canvas.width = canvasWidth;
            canvas.height = canvasHeight;

            if (options.fillColor) {
                context.fillStyle = options.fillColor;
                context.fillRect(0, 0, canvasWidth, canvasHeight);
            }

            // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D.drawImage
            const parameters = function () {
                const source = getSourceCanvas(self.$clone[0], self.image, options);
                const sourceWidth = source.width;
                const sourceHeight = source.height;
                const canvasData = self.canvas;
                const params = [source];

                // Source canvas
                let srcX = data.x + canvasData.naturalWidth * (Math.abs(data.scaleX || 1) - 1) / 2;
                let srcY = data.y + canvasData.naturalHeight * (Math.abs(data.scaleY || 1) - 1) / 2;
                let srcWidth = void 0;
                let srcHeight = void 0;

                // Destination canvas
                let dstX = void 0;
                let dstY = void 0;
                let dstWidth = void 0;
                let dstHeight = void 0;

                if (srcX <= -originalWidth || srcX > sourceWidth) {
                    srcX = 0;
                    srcWidth = 0;
                    dstX = 0;
                    dstWidth = 0;
                } else if (srcX <= 0) {
                    dstX = -srcX;
                    srcX = 0;
                    dstWidth = Math.min(sourceWidth, originalWidth + srcX);
                    srcWidth = dstWidth;
                } else if (srcX <= sourceWidth) {
                    dstX = 0;
                    dstWidth = Math.min(originalWidth, sourceWidth - srcX);
                    srcWidth = dstWidth;
                }

                if (srcWidth <= 0 || srcY <= -originalHeight || srcY > sourceHeight) {
                    srcY = 0;
                    srcHeight = 0;
                    dstY = 0;
                    dstHeight = 0;
                } else if (srcY <= 0) {
                    dstY = -srcY;
                    srcY = 0;
                    dstHeight = Math.min(sourceHeight, originalHeight + srcY);
                    srcHeight = dstHeight;
                } else if (srcY <= sourceHeight) {
                    dstY = 0;
                    dstHeight = Math.min(originalHeight, sourceHeight - srcY);
                    srcHeight = dstHeight;
                }

                // All the numerical parameters should be integer for `drawImage` (#476)
                params.push(Math.floor(srcX), Math.floor(srcY), Math.floor(srcWidth), Math.floor(srcHeight));

                // Scale destination sizes
                if (scaledRatio) {
                    dstX *= scaledRatio;
                    dstY *= scaledRatio;
                    dstWidth *= scaledRatio;
                    dstHeight *= scaledRatio;
                }

                // Avoid "IndexSizeError" in IE and Firefox
                if (dstWidth > 0 && dstHeight > 0) {
                    params.push(Math.floor(dstX), Math.floor(dstY), Math.floor(dstWidth), Math.floor(dstHeight));
                }

                return params;
            }();

            context.imageSmoothingEnabled = !!options.imageSmoothingEnabled;

            if (options.imageSmoothingQuality) {
                context.imageSmoothingQuality = options.imageSmoothingQuality;
            }

            context.drawImage.apply(context, _toConsumableArray(parameters));

            return canvas;
        },


        /**
         * Change the aspect ratio of the crop box
         *
         * @param {Number} aspectRatio
         */
        setAspectRatio: function setAspectRatio(aspectRatio) {
            const self = this;
            const options = self.options;

            if (!self.disabled && !isUndefined(aspectRatio)) {
                // 0 -> NaN
                options.aspectRatio = Math.max(0, aspectRatio) || NaN;

                if (self.ready) {
                    self.initCropBox();

                    if (self.cropped) {
                        self.renderCropBox();
                    }
                }
            }
        },


        /**
         * Change the drag mode
         *
         * @param {String} mode (optional)
         */
        setDragMode: function setDragMode(mode) {
            const self = this;
            const options = self.options;
            let croppable = void 0;
            let movable = void 0;

            if (self.loaded && !self.disabled) {
                croppable = mode === 'crop';
                movable = options.movable && mode === 'move';
                mode = croppable || movable ? mode : 'none';

                self.$dragBox.data('action', mode).toggleClass('cropper-crop', croppable).toggleClass('cropper-move', movable);

                if (!options.cropBoxMovable) {
                    // Sync drag mode to crop box when it is not movable(#300)
                    self.$face.data('action', mode).toggleClass('cropper-crop', croppable).toggleClass('cropper-move', movable);
                }
            }
        }
    };

    const _createClass = function () {
        function defineProperties(target, props) {
            for (let i = 0; i < props.length; i++) {
                const descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    const CLASS_HIDDEN = 'cropper-hidden';
    const REGEXP_DATA_URL = /^data:/;
    const REGEXP_DATA_URL_JPEG = /^data:image\/jpeg;base64,/;

    const Cropper = function () {
        function Cropper(element, options) {
            _classCallCheck(this, Cropper);

            const self = this;

            self.$element = $(element);
            self.options = $.extend({}, DEFAULTS, $.isPlainObject(options) && options);
            self.loaded = false;
            self.ready = false;
            self.completed = false;
            self.rotated = false;
            self.cropped = false;
            self.disabled = false;
            self.replaced = false;
            self.limited = false;
            self.wheeling = false;
            self.isImg = false;
            self.originalUrl = '';
            self.canvas = null;
            self.cropBox = null;
            self.pointers = {};
            self.init();
        }

        _createClass(Cropper, [{
            key: 'init',
            value: function init() {
                const self = this;
                const $this = self.$element;
                let url = void 0;

                if ($this.is('img')) {
                    self.isImg = true;

                    // Should use `$.fn.attr` here. e.g.: "img/picture.jpg"
                    url = $this.attr('src');
                    self.originalUrl = url;

                    // Stop when it's a blank image
                    if (!url) {
                        return;
                    }

                    // Should use `$.fn.prop` here. e.g.: "http://example.com/img/picture.jpg"
                    url = $this.prop('src');
                } else if ($this.is('canvas') && window.HTMLCanvasElement) {
                    url = $this[0].toDataURL();
                }

                self.load(url);
            }

            // A shortcut for triggering custom events

        }, {
            key: 'trigger',
            value: function trigger(type, data) {
                const e = $.Event(type, data);

                this.$element.trigger(e);

                return e;
            }
        }, {
            key: 'load',
            value: function load(url) {
                const self = this;
                const options = self.options;
                const $this = self.$element;

                if (!url) {
                    return;
                }

                self.url = url;
                self.image = {};

                if (!options.checkOrientation || !window.ArrayBuffer) {
                    self.clone();
                    return;
                }

                // XMLHttpRequest disallows to open a Data URL in some browsers like IE11 and Safari
                if (REGEXP_DATA_URL.test(url)) {
                    if (REGEXP_DATA_URL_JPEG.test(url)) {
                        self.read(dataURLToArrayBuffer(url));
                    } else {
                        self.clone();
                    }
                    return;
                }

                const xhr = new XMLHttpRequest();

                xhr.onerror = $.proxy(function () {
                    self.clone();
                }, this);

                xhr.onload = function load() {
                    self.read(this.response);
                };

                if (options.checkCrossOrigin && isCrossOriginURL(url) && $this.prop('crossOrigin')) {
                    url = addTimestamp(url);
                }

                xhr.open('get', url);
                xhr.responseType = 'arraybuffer';
                xhr.withCredentials = $this.prop('crossOrigin') === 'use-credentials';
                xhr.send();
            }
        }, {
            key: 'read',
            value: function read(arrayBuffer) {
                const self = this;
                const options = self.options;
                const orientation = getOrientation(arrayBuffer);
                const image = self.image;
                let rotate = 0;
                let scaleX = 1;
                let scaleY = 1;

                if (orientation > 1) {
                    self.url = arrayBufferToDataURL(arrayBuffer);

                    switch (orientation) {
                        // flip horizontal
                        case 2:
                            scaleX = -1;
                            break;

                        // rotate left 180°
                        case 3:
                            rotate = -180;
                            break;

                        // flip vertical
                        case 4:
                            scaleY = -1;
                            break;

                        // flip vertical + rotate right 90°
                        case 5:
                            rotate = 90;
                            scaleY = -1;
                            break;

                        // rotate right 90°
                        case 6:
                            rotate = 90;
                            break;

                        // flip horizontal + rotate right 90°
                        case 7:
                            rotate = 90;
                            scaleX = -1;
                            break;

                        // rotate left 90°
                        case 8:
                            rotate = -90;
                            break;

                        default:
                    }
                }

                if (options.rotatable) {
                    image.rotate = rotate;
                }

                if (options.scalable) {
                    image.scaleX = scaleX;
                    image.scaleY = scaleY;
                }

                self.clone();
            }
        }, {
            key: 'clone',
            value: function clone() {
                const self = this;
                const options = self.options;
                const $this = self.$element;
                const url = self.url;
                let crossOrigin = '';
                let crossOriginUrl = void 0;

                if (options.checkCrossOrigin && isCrossOriginURL(url)) {
                    crossOrigin = $this.prop('crossOrigin');

                    if (crossOrigin) {
                        crossOriginUrl = url;
                    } else {
                        crossOrigin = 'anonymous';

                        // Bust cache (#148) when there is not a "crossOrigin" property
                        crossOriginUrl = addTimestamp(url);
                    }
                }

                self.crossOrigin = crossOrigin;
                self.crossOriginUrl = crossOriginUrl;

                const image = document.createElement('img');

                if (crossOrigin) {
                    image.crossOrigin = crossOrigin;
                }

                image.src = crossOriginUrl || url;

                const $clone = $(image);

                self.$clone = $clone;

                if (self.isImg) {
                    if ($this[0].complete) {
                        self.start();
                    } else {
                        $this.one('load', $.proxy(self.start, this));
                    }
                } else {
                    $clone.one('load', $.proxy(self.start, this)).one('error', $.proxy(self.stop, this)).addClass('cropper-hide').insertAfter($this);
                }
            }
        }, {
            key: 'start',
            value: function start() {
                const self = this;
                const $clone = self.$clone;
                let $image = self.$element;

                if (!self.isImg) {
                    $clone.off('error', self.stop);
                    $image = $clone;
                }

                getImageSize($image[0], function (naturalWidth, naturalHeight) {
                    $.extend(self.image, {
                        naturalWidth: naturalWidth,
                        naturalHeight: naturalHeight,
                        aspectRatio: naturalWidth / naturalHeight
                    });

                    self.loaded = true;
                    self.build();
                });
            }
        }, {
            key: 'stop',
            value: function stop() {
                const self = this;

                self.$clone.remove();
                self.$clone = null;
            }
        }, {
            key: 'build',
            value: function build() {
                const self = this;
                const options = self.options;
                const $this = self.$element;
                const $clone = self.$clone;

                if (!self.loaded) {
                    return;
                }

                // Unbuild first when replace
                if (self.ready) {
                    self.unbuild();
                }

                const $cropper = $(TEMPLATE);
                const $cropBox = $cropper.find('.cropper-crop-box');
                const $face = $cropBox.find('.cropper-face');

                // Create cropper elements
                self.$container = $this.parent();
                self.$cropper = $cropper;
                self.$canvas = $cropper.find('.cropper-canvas').append($clone);
                self.$dragBox = $cropper.find('.cropper-drag-box');
                self.$cropBox = $cropBox;
                self.$viewBox = $cropper.find('.cropper-view-box');
                self.$face = $face;

                // Hide the original image
                $this.addClass(CLASS_HIDDEN).after($cropper);

                // Show the clone image if is hidden
                if (!self.isImg) {
                    $clone.removeClass('cropper-hide');
                }

                self.initPreview();
                self.bind();

                options.aspectRatio = Math.max(0, options.aspectRatio) || NaN;
                options.viewMode = Math.max(0, Math.min(3, Math.round(options.viewMode))) || 0;

                self.cropped = options.autoCrop;

                if (options.autoCrop) {
                    if (options.modal) {
                        self.$dragBox.addClass('cropper-modal');
                    }
                } else {
                    $cropBox.addClass(CLASS_HIDDEN);
                }

                if (!options.guides) {
                    $cropBox.find('.cropper-dashed').addClass(CLASS_HIDDEN);
                }

                if (!options.center) {
                    $cropBox.find('.cropper-center').addClass(CLASS_HIDDEN);
                }

                if (options.cropBoxMovable) {
                    $face.addClass('cropper-move').data('action', 'all');
                }

                if (!options.highlight) {
                    $face.addClass('cropper-invisible');
                }

                if (options.background) {
                    $cropper.addClass('cropper-bg');
                }

                if (!options.cropBoxResizable) {
                    $cropBox.find('.cropper-line, .cropper-point').addClass(CLASS_HIDDEN);
                }

                self.setDragMode(options.dragMode);
                self.render();
                self.ready = true;
                self.setData(options.data);

                // Trigger the ready event asynchronously to keep `data('cropper')` is defined
                self.completing = setTimeout(function () {
                    if ($.isFunction(options.ready)) {
                        $this.one('ready', options.ready);
                    }

                    self.trigger('ready');
                    self.trigger('crop', self.getData());
                    self.completed = true;
                }, 0);
            }
        }, {
            key: 'unbuild',
            value: function unbuild() {
                const self = this;

                if (!self.ready) {
                    return;
                }

                if (!self.completed) {
                    clearTimeout(self.completing);
                }

                self.ready = false;
                self.completed = false;
                self.initialImage = null;

                // Clear `initialCanvas` is necessary when replace
                self.initialCanvas = null;
                self.initialCropBox = null;
                self.container = null;
                self.canvas = null;

                // Clear `cropBox` is necessary when replace
                self.cropBox = null;
                self.unbind();

                self.resetPreview();
                self.$preview = null;

                self.$viewBox = null;
                self.$cropBox = null;
                self.$dragBox = null;
                self.$canvas = null;
                self.$container = null;

                self.$cropper.remove();
                self.$cropper = null;
            }
        }], [{
            key: 'setDefaults',
            value: function setDefaults(options) {
                $.extend(DEFAULTS, $.isPlainObject(options) && options);
            }
        }]);

        return Cropper;
    }();

    $.extend(Cropper.prototype, render);
    $.extend(Cropper.prototype, preview);
    $.extend(Cropper.prototype, events);
    $.extend(Cropper.prototype, handlers);
    $.extend(Cropper.prototype, change);
    $.extend(Cropper.prototype, methods);

    const NAMESPACE = 'cropper';
    const OtherCropper = $.fn.cropper;

    $.fn.cropper = function jQueryCropper(option) {
        let args = Array(_len > 1 ? _len - 1 : 0);
        let _len = arguments.length;
        let _key = 1;
        for (; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
        }

        let result = void 0;

        this.each(function (i, element) {
            const $this = $(element);
            let data = $this.data(NAMESPACE);

            if (!data) {
                if (/destroy/.test(option)) {
                    return;
                }

                const options = $.extend({}, $this.data(), $.isPlainObject(option) && option);
                $this.data(NAMESPACE, data = new Cropper(element, options));
            }

            if (typeof option === 'string') {
                const fn = data[option];

                if ($.isFunction(fn)) {
                    result = fn.apply(data, args);
                }
            }
        });

        return typeof result !== 'undefined' ? result : this;
    };

    $.fn.cropper.Constructor = Cropper;
    $.fn.cropper.setDefaults = Cropper.setDefaults;

    // No conflict
    $.fn.cropper.noConflict = function noConflict() {
        $.fn.cropper = OtherCropper;
        return this;
    };

    exports('cropper', $.fn.cropper);
});