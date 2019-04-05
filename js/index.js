var img, c1,ctx1,c2,ctx2;//c1显示原图，c2显示处理后的图像, img为Imgae对象

//得到灰度图
function acceptImg() {
    var fileInputs = document.querySelector('#file');
    fileInputs.addEventListener("change", function () {
        var file = fileInputs.files[0];
        console.log(file);
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            img.src = this.result;
            if(!img.complete) {
                console.log("failed")
                img.onload = function () {
                    clearCanvas();
                    setCanvas();
                    show();
                }
            }else{
                clearCanvas();
                setCanvas();
                show();
            }

        }
    })
}

//设置画布宽高
function setCanvas() {
    c1.width = c2.width = img.width + 20;
    c1.height = c2.height = img.height + 20;
    console.log(c1.width)
    console.log(c2.height)
}

//清空画布
function clearCanvas() {
    ctx1.clearRect(0, 0, c1.width, c1.height);
    ctx2.clearRect(0, 0, c2.width, c2.height);
}

//显示图片
function show() {
    ctx1.drawImage(img, 10, 10)
    //获取图片
    var imgData = ctx1.getImageData(10, 10, c1.width, c1.height);
    for(let i = 0; i < imgData.data.length; i+=4) {
        // imgData.data[i] = 0;
        average = Math.floor((imgData.data[i]+imgData.data[i+1]+imgData.data[i+2])/3);  //将红、绿、蓝色值求平均值后得到灰度值
        imgData.data[i] = imgData.data[i+1] = imgData.data[i+2] = average;
    }
    ctx2.putImageData(imgData,10,10);
    setDownload(c2, "klx");
}

//设置下载链接
function setDownload(canvas, name) {
    var strDataUrl = canvas.toDataURL("image/png");
    var a = document.querySelector("#download");
    a.setAttribute("href", strDataUrl);
    a.setAttribute("download", name);
}

window.onload = function () {
    img = new Image();
    c1 = document.querySelector('#Canvas1');
    ctx1 = c1.getContext('2d');
    c2 = document.querySelector('#Canvas2');
    ctx2 = c2.getContext('2d');
    acceptImg();
}