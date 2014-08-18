define("Kanvas.Container:Kanvas.DisplayObject", {
    ctor: function () {
        this._super();
        this.children = [];
    },
    draw: function (ctx) {
        for (var i = 0, len = this.children.length; i < len; i++) {
            var child=this.children[i];
            ctx.save();
            child.updateContext(ctx);
            child.draw(ctx);
            ctx.restore();          
        }
    },
    add: function (obj) {
        if (arguments.length > 1) {
            this.children.push.apply(this.children, Array.prototype.slice.call(arguments));
        } else {
            this.children.push(obj);
        }
    },
    _getHitChild: function (ctx,x,y) {
        var l = this.children.length;
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        for (var i = l - 1; i >= 0; i--) {
            var child = this.children[i];           
            ctx.save();
            child.updateContext(ctx);
            child.draw(ctx);
            ctx.restore();
            if (ctx.getImageData(x, y, 1, 1).data[3] > 1) {
                return child;
            }
        }
       
    }
})