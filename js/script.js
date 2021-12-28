let app = new Vue({
    el: '#app',
    data() {
        return {
            selectedImage: "",
            isImageLoad: true,
        }
    },
    created() {

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
        
            const faceDetector = new window.FaceDetector();
            const image = this.$refs.image;
            faceDetector.detect(image).then((faces) => {
                console.log(faces)
                for(let face in faces) {
                    console.log(face);
                }
            }).catch((e) => {
                console.log(e);
            })
        }
    },
})