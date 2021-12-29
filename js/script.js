let app = new Vue({
    el: '#app',
    data() {
        return {
            selectedImage: "",
            selectedImageHeight: 0,
            selectedImageWidht: 0,
            isImageLoad: true,
            ctxImageData: "",
            canvas: "",
            sliderValue: 0,
        }
    },
    methods: {
        getInputFile() {
            const selectedFiles = this.$refs.file;
            const selectedFile = selectedFiles.files[0];
            
            this.showInputFile(selectedFile);
        },
        showInputFile(file) {
            this.selectedImage = window.URL.createObjectURL(file);
            this.isImageLoad = false;
        },
        detectFaces() {
            if(window.FaceDetector == undefined) {
                console.log("Not Supported")
                return;
            }
            
            const image = this.$refs.image;
            const canvas = this.$refs.canvas;
            const ctx = canvas.getContext('2d');

            canvas.height = image.naturalHeight;
            canvas.width = image.naturalWidth;

            ctx.drawImage(image, 0, 0);
            
            if(Number(this.sliderValue) === 0) return;

            this.ctxImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            const faceDetector = new window.FaceDetector();
            faceDetector.detect(image).then((faces) => {
                faces.forEach((face) => {
                    let faceValue = face.boundingBox, mosaicSize = Number(this.sliderValue);
                    console.log(faceValue)
                    for(let y = faceValue.top; y <= faceValue.bottom-mosaicSize; y += mosaicSize) {
                        for(let x = faceValue.left; x <= faceValue.right-mosaicSize; x += mosaicSize) {
                            this.createMosaic(x, y, mosaicSize, mosaicSize);
                        }
                    }
                })
            }).catch((e) => {
                console.log(e);
            })
        },
        createMosaic(x, y, w, h) {
            let ctx = this.$refs.canvas.getContext('2d')
            let r = 0, g = 0, b = 0;
            
            let src = ctx.getImageData(x, y, w, h);
            let dst = ctx.createImageData(w, h)

            for (let i = 0; i < src.data.length; i += 4) {
                r += src.data[i]
                g += src.data[i + 1]
                b += src.data[i + 2]
            }

            r /= src.data.length / 4
            g /= src.data.length / 4
            b /= src.data.length / 4

            r = Math.ceil(r)
            g = Math.ceil(g)
            b = Math.ceil(b)

            for (let i = 0; i < src.data.length; i += 4) {
                dst.data[i] = r
                dst.data[i + 1] = g
                dst.data[i + 2] = b
                dst.data[i + 3] = 255
            }

            ctx.putImageData(dst, x, y)
        },
        downloadResultImage() {
            const canvas = this.$refs.canvas;
            let base64 = canvas.toDataURL("image/jpeg");
            this.$refs.download.href = base64;
        }
    },
})