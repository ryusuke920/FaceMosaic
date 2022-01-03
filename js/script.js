let app = new Vue({
    el: '#app',
    data() {
        return {
            selectedFile: "",
            isImageLoad: false,
            ctxImageData: "",
            sliderValue: 0,
            canvas: "",
            ctx: {},
        }
    },
    mounted() {// アプリ起動時の処理 
        this.canvas = this.$refs.canvas;
        if(!this.canvas.getContext) {// canvas非対応
            console.log("Canvas Not Supported");
            return;
        }
        this.ctx = this.canvas.getContext('2d');
    },
    methods: {
        /**
         * 選択された画像を取得
         */
        getInputFile() {
            const selectedFiles = this.$refs.file;
            this.selectedFile = selectedFiles.files[0];
            this.isImageLoad = true;
            this.detectFaces();// モザイクがかかっていない画像を表示
        },
        /**
         * 画像内の顔を認識して、モザイクをかける
         * @returns 
         */
        detectFaces() {
            if(window.FaceDetector === undefined) {// ブラウザがサポートしていない場合、終了
                console.log("Not Supported")
                return;
            }
    
            // imgタグを取得
            const image = new Image();
            image.src = window.URL.createObjectURL(this.selectedFile);

            image.onload = () => {
                // canvasの大きさを画像の大きさに合わせる
                this.canvas.height = image.naturalHeight;
                this.canvas.width = image.naturalWidth;

                // contextに画像を描写
                this.ctx.drawImage(image, 0, 0);

                // スライダーの値が0の時はモザイクをかける必要はないため、終了
                if(Number(this.sliderValue) === 0) return;

                // contextに描画された画像データを取得
                this.ctxImageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);

                // FaceDetectorAPIによる顔認識処理
                const faceDetector = new window.FaceDetector();
                faceDetector.detect(image).then((faces) => {

                    faces.forEach((face) => {// 認識した全ての顔に以下の処理を行う
                        let faceValue = face.boundingBox; // 画像内の顔情報を取得(画像内の顔の位置など)
                        let mosaicSize = Number(this.sliderValue);
                        
                        // 取得した顔の位置情報を基に、モザイクをかける
                        for(let y = faceValue.top; y <= faceValue.bottom-mosaicSize; y += mosaicSize) {
                            for(let x = faceValue.left; x <= faceValue.right-mosaicSize; x += mosaicSize) {
                                this.createMosaic(x, y, mosaicSize, mosaicSize);
                            }
                        }
                    })

                }).catch((e) => {
                    console.log(e);
                })
            }
            
            
        },
        /**
         * 画像にモザイクをかける
         * @param {number} x - モザイクをかける始点(x方向)
         * @param {number} y - モザイクをかける始点(y方向)
         * @param {number} w - モザイクの幅
         * @param {number} h - モザイクの高さ
         */
        createMosaic(x, y, w, h) {
            let r = 0, g = 0, b = 0;
            
            let src = this.ctx.getImageData(x, y, w, h); // contextの画像データ
            let dst = this.ctx.createImageData(w, h) // サイズw x hのモザイク本体

            /*
                RGB値の総和を求める
                src.dataには、選択した範囲の画像データがR,G,B,A(透明度）の順番に、選択した画像データの長さだけ並んでいるため、+=4をしている
            */
            for (let i = 0; i < src.data.length; i += 4) {
                r += src.data[i]
                g += src.data[i + 1]
                b += src.data[i + 2]
            }

            // RGB値の各値の平均値を求める
            r /= (src.data.length / 4)
            g /= (src.data.length / 4)
            b /= (src.data.length / 4)

            // 整数値に変換
            r = Math.ceil(r)
            g = Math.ceil(g)
            b = Math.ceil(b)
            
            // モザイクのrgb値と透明度を決定
            for (let i = 0; i < src.data.length; i += 4) {
                dst.data[i] = r
                dst.data[i + 1] = g
                dst.data[i + 2] = b
                dst.data[i + 3] = 255
            }

            // contextにモザイクを描写
            this.ctx.putImageData(dst, x, y)
        },
        /**
         * モザイクをかけた画像データをダウンロードする
         */
        downloadResultImage() {
            let base64 = this.canvas.toDataURL("image/jpeg");
            this.$refs.download.href = base64; // aタグのリンクにbase64で暗号化した画像データをのせる
        }
    },
})