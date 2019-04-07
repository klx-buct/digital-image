class Canvas{
    constructor(c1, c2) {
        this.img = new Image();
        this.c1 = c1;
        this.c2 = c2;
        this.ctx = "";
        this.avgM = [1, 1, 1, 1, 1, 1, 1, 1, 1];//均值滤波
        this.sharpenM = [-1,-1,-1,-1,9,-1,-1,-1,-1];// 锐化
        this.ctx1 = c1.getContext('2d');
        this.ctx2 = c2.getContext('2d');
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext("2d");
    }

    bilateralFilter(sigma) { // 双边滤波
        console.log('isok')
        var Matrix = [], sum=0,Matrix1=[],Matrix2=[];
        var imgData = this.ctx2.getImageData(10, 10, this.img.width, this.img.height);
        var init = this.ctx2.getImageData(10, 10, this.img.width, this.img.height).data;
        var data = imgData.data, h = this.img.height, w = this.img.width;
        var i = 0, j;
        for(let b = 1;b >= -1; b--) {
            for(let a = -1; a <= 1; a++) {
                Matrix1[i] = Math.exp(-(a*a+b*b)/(2*sigma*sigma));
                i++;
            }
        }
        for (var y = 1; y < h-1; y += 1) {
            for (var x = 1; x < w-1; x += 1) {
                var num=0;
                sum=0;
                for(let b = 1;b >= -1; b--) {
                    for(let a = -1; a <= 1; a++) {
                        i = x+a, j = y+b;
                        var diff = data[(j*w+i)*4]+data[(j*w+i)*4+1]+data[(j*w+i)*4+2]
                            - (data[(y*w+x)*4]+data[(y*w+x)*4+1]+data[(y*w+x)*4+2]);
                        // console.log(diff + " " + i + " " + j)
                        Matrix2[num] = Math.exp(-Math.abs(diff)/(2*sigma*sigma));
                        Matrix[num] = Matrix1[num]*Matrix2[num];
                        sum+=Matrix[num];
                        num++;
                    }
                }
                for (var c = 0; c < 3; c += 1) {
                    i = (y*w + x)*4 + c;
                    // 卷积核计算
                    data[i] = (Matrix[0]*init[i-w*4-4] + Matrix[1]*init[i-w*4] + Matrix[2]*init[i-w*4+4]
                        + Matrix[3]*init[i-4]     + Matrix[4]*init[i]     + Matrix[5]*init[i+4]
                        + Matrix[6]*init[i+w*4-4] + Matrix[7]*init[i+w*4] + Matrix[8]*init[i+w*4+4])
                        / sum;
                }
            }
        }
        this.ctx2.clearRect(0, 0, this.c2.width, this.c2.height);
        this.ctx2.putImageData(imgData,10,10);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.putImageData(imgData, 10, 10)
        this.setDownload(this.c2, "klx");
    }

    gauss(sigma) {
        /*
        如果中心点坐标为(0, 0)，周围八个点坐标如下，由此生成高斯矩阵
        (-1, 1) (0, 1) (1, 1)
        (-1, 0) (0, 0) (1, 0)
        (-1, -1) (0, -1) (1, -1)
         */
        var gaussMatrix = [];
        var gaussSum = 0;
        let i = 0;
        for(let y = 1;y >= -1; y--) {
            for(let x = -1; x <= 1; x++) {
                gaussMatrix[i] = 1/(2*(Math.PI)*sigma*sigma)*Math.exp(-(x*x+y*y)/(2*sigma*sigma));
                gaussSum += gaussMatrix[i];
                i++;
            }
        }
        for(i = 0; i < 9; i++) {//除以权重合，得到最终权重矩阵
            gaussMatrix[i] = gaussMatrix[i] / gaussSum;
        }
        this.filter(gaussMatrix, 1);
    }

    sharpen() {// 锐化
        var m = [0, 0, 0, 0, 2, 0, 0, 0, 0];
        var imgData = this.ctx2.getImageData(10, 10, this.img.width, this.img.height);
        var init = this.ctx2.getImageData(10, 10, this.img.width, this.img.height).data;
        var data = imgData.data, h = this.img.height, w = this.img.width;
        for (var y = 1; y < h-1; y += 1) {
            for (var x = 1; x < w-1; x += 1) {
                for (var c = 0; c < 3; c += 1) {
                    var i = (y*w + x)*4 + c;
                    // 卷积核计算
                    data[i] = (m[0]*init[i-w*4-4] + m[1]*init[i-w*4] + m[2]*init[i-w*4+4]
                        + m[3]*init[i-4]     + m[4]*init[i]     + m[5]*init[i+4]
                        + m[6]*init[i+w*4-4] + m[7]*init[i+w*4] + m[8]*init[i+w*4+4])
                        -(init[i-w*4-4]+init[i-w*4]+init[i-w*4+4]
                            +init[i-4]+init[i]+init[i+4]
                            +init[i+w*4-4]+init[i+w*4]+init[i+w*4+4])/9;
                }
                // data[(y*w + x)*4+3] = 0;
            }
        }
        this.ctx2.clearRect(0, 0, this.c2.width, this.c2.height);
        this.ctx2.putImageData(imgData,10,10);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.putImageData(imgData, 10, 10)
        this.setDownload(this.c2, "klx");
    }

    filter(m, divisor){// 滤波
        var imgData = this.ctx2.getImageData(10, 10, this.img.width, this.img.height);
        var init = this.ctx2.getImageData(10, 10, this.img.width, this.img.height).data;
        var data = imgData.data, h = imgData.height, w = imgData.width;
        var count=0;
        for (var y = 1; y < h-1; y += 1) {
            for (var x = 1; x < w-1; x += 1) {
                for (var c = 0; c < 3; c += 1) {
                    var i = (y*w + x)*4 + c;
                    // 卷积核计算
                    data[i] = (m[0]*init[i-w*4-4] + m[1]*init[i-w*4] + m[2]*init[i-w*4+4]
                            + m[3]*init[i-4]     + m[4]*init[i]     + m[5]*init[i+4]
                            + m[6]*init[i+w*4-4] + m[7]*init[i+w*4] + m[8]*init[i+w*4+4])/divisor;
                }
            }
        }
        this.ctx2.clearRect(0, 0, this.c2.width, this.c2.height);
        this.ctx2.putImageData(imgData,10,10);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.putImageData(imgData, 10, 10)
        this.setDownload(this.c2, "klx");
    }

    setDownload(name) { //设置下载链接
        var strDataUrl = this.c2.toDataURL("image/png");
        var a = document.querySelector("#download");
        a.setAttribute("href", strDataUrl);
        a.setAttribute("download", name);
    }

    setCanvas() { // 用户选择图片后加载到画布上
        var fileInputs = document.querySelector('#file');
        var that = this;
        fileInputs.addEventListener("change", function () {
            var file = fileInputs.files[0];
            var reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function () {
                that.img.src = this.result;
                if(!that.img.complete) {
                    that.img.onload = function () {
                        that.init();
                    }
                }else{
                    that.init();
                }
            }
        })
    }

    restore() {// 初始化
        var imgData = this.ctx1.getImageData(10, 10, this.img.width, this.img.height);
        this.ctx2.clearRect(0, 0, this.c2.width, this.c2.height);
        this.ctx2.putImageData(imgData,10,10);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.putImageData(imgData, 10, 10)
        this.setDownload(this.c2, "klx");
    }

    save() {
        var imgData = this.ctx2.getImageData(10, 10, this.img.width, this.img.height);
        this.ctx1.clearRect(0, 0, this.c1.width, this.c1.height);
        this.ctx1.putImageData(imgData,10,10);
        this.setDownload(this.c2, "klx");
    }

    saturation(r) {//调节饱和度
        var imgData = this.ctx.getImageData(10, 10, this.img.width, this.img.height);
        for(let i = 0; i < imgData.data.length; i+=4) {
            imgData.data[i] = imgData.data[i] + (imgData.data[i]-(imgData.data[i+1]+imgData.data[i+1])/2)*r;
            imgData.data[i+1] = imgData.data[i+1] + (imgData.data[i+1]-(imgData.data[i+2]+imgData.data[i])/2)*r;
            imgData.data[i+2] = imgData.data[i+2] + (imgData.data[i+2]-(imgData.data[i+1]+imgData.data[i+2])/2)*r;
        }
        this.ctx2.clearRect(0, 0, this.c2.width, this.c2.height);
        this.ctx2.putImageData(imgData,10,10);
        this.setDownload(this.c2, "klx");
    }

    contrast(a, b) { // 调节对比度和亮度
        //console.log(this.ctx.getImageData(10, 10, this.img.width, this.img.height));
        var imgData = this.ctx.getImageData(10, 10, this.img.width, this.img.height);
        for(let i = 0; i < imgData.data.length; i+=4) {
            var temp = ((imgData.data[i] - 128)*a+128)*b;
            if(temp <= 0) imgData.data[i]=0;
            else if(temp >= 255) imgData.data[i] = 255;
            else imgData.data[i] = temp;


            temp = ((imgData.data[i+1] - 128)*a+128)*b;
            if(temp <= 0) imgData.data[i+1]=0;
            else if(temp >= 255) imgData.data[i+1] = 255;
            else imgData.data[i+1] = temp;

            temp = ((imgData.data[i+2] - 128)*a+128)*b;
            if(temp <= 0) imgData.data[i+2]=0;
            else if(temp >= 255) imgData.data[i+2] = 255;
            else imgData.data[i+2] = temp;
        }
        this.ctx2.clearRect(0, 0, this.c2.width, this.c2.height);
        this.ctx2.putImageData(imgData,10,10);
        this.setDownload(this.c2, "klx");
        // console.log(this.imgData);
    }

    gray() { // 显示灰度图像
        var imgData = this.ctx.getImageData(10, 10, this.img.width, this.img.height);
        // console.log(imgData)
        for(let i = 0; i < imgData.data.length; i+=4) {
            var average = (imgData.data[i]*299 + imgData.data[i+1]*587 + imgData.data[i+2]*114 + 500) / 1000
            imgData.data[i] = imgData.data[i+1] = imgData.data[i+2] = average;
        }
        this.ctx2.clearRect(0, 0, this.c2.width, this.c2.height);
        this.ctx2.putImageData(imgData,10,10);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.putImageData(imgData, 10, 10)
        this.setDownload(this.c2, "klx");
    }

    init() {//初始化画布
        var c1 = this.c1,c2 = this.c2,ctx1=this.ctx1,ctx2=this.ctx2;
        //清空画布
        ctx1.clearRect(0, 0, c1.width, c1.height);
        ctx2.clearRect(0, 0, c2.width, c2.height);
        (this.ctx).clearRect(0, 0, this.canvas.width, this.canvas.height)
        //设置画布高宽
        this.canvas.width = c1.width = c2.width = this.img.width + 20;
        this.canvas.height = c1.height = c2.height = this.img.height + 20;
        //将图片放到画布上
        ctx1.drawImage(this.img, 10, 10);
        ctx2.drawImage(this.img, 10, 10);
        this.ctx.drawImage(this.img, 10, 10);
        //设置下载链接
        this.setDownload("klx");
    }
}