var sliding = function (show, value) {//value滑块初值
    var drage = false;
    var lastClientX=0;
    var timer;
    var val=value;
    this.getDrage = function () {
        return drage;
    }
    this.getVal = function () {
        return val;
    }
    this.getTimer = function () {
        return timer;
    }
    this.setTimer = function (t) {
        timer = t;
    }
    this.init = function(name, mousemove) {// mousemove移动时执行的函数，show右边显示的数
        var id = "#"+name;
        var s = document.querySelector(id);
        s.style.left = s.getBoundingClientRect().left + val + "px";
        var parent = document.querySelector(id+"Parent");
        s.onmousedown = function (e) {
            drage = true;
            lastClientX = e.clientX;
        }
        parent.onmousemove = function (event) {
            if(drage) {
                // console.log(val)
                let nowClientX = event.clientX;

                let offsetX = nowClientX - lastClientX;
                val += offsetX;
                if(val <= 100 && val >= 0){
                    s.style.left = s.getBoundingClientRect().left + offsetX + "px";
                    document.querySelector(id+"Val").innerHTML = show(val);
                   mousemove();
                }
                else{
                    val -= offsetX;
                    drage=false;
                }
                lastClientX = event.clientX;
            }
        }
        parent.onmouseup = function () {
            drage = false;
        }
    }
};