class Rotator {
    /**
     * Main rotator class.
     */
    constructor() {
        /**
         * Event handlers for rotation.
         * @type {((this: Rotator, alpha: number) => void)[]}
         */
        this.rotationHandlers = [];

        /**
         * The current rotation. The rotation starts right and goes counter-clockwise.
         * @type {number}
         */
        this.currentAlpha = 0;

        /**
         * If the rotator is currently in rotation state.
         * @type {boolean}
         */
        this.rotating = false;

        /**
         * The rotation when the rotation process is started.
         * @type {number}
         * @private
         */
        this._rotationStart = 0;

        /**
         * The alpha of the mouse/finger when the rotation process is started.
         * @type {number}
         * @private
         */
        this._userRotationStart = 0;
    }

    /**
     * Attach touch events to element.
     * @param {HTMLElement} element The element to add the listeners to
     */
    touchEvents(element) {
        /** @type {typeof HTMLElement.addEventListener} */
        const on = element.on || element.addEventListener;
        function calcXY(/** @type {TouchEvent} */ e) {
            const centerX = element.offsetWidth / 2;
            const centerY = element.offsetHeight / 2;
            const relativeX = e.touches[0].clientX - element.offsetLeft;
            const relativeY = e.touches[0].clientY - element.offsetTop;
            return [relativeX - centerX, centerY - relativeY];
        }
        on("touchstart", e => {
            e.preventDefault();
            this.rotateStart(...calcXY(e));
        });
        on("touchmove", e => {
            if (!this.rotating) return;
            e.preventDefault();
            this.rotateMove(...calcXY(e));
        });
        on("touchend", e => {
            e.preventDefault();
            this.rotateStop();
        });
    }

    /**
     * Attach touch events to element.
     * @param {HTMLElement} element The element to add the listeners to
     */
    mouseEvents(element) {
        const on = element.on || element.addEventListener;
        function calcXY(/** @type {MouseEvent} */ e) {
            const centerX = element.offsetWidth / 2;
            const centerY = element.offsetHeight / 2;
            const relativeX = e.clientX - element.offsetLeft;
            const relativeY = e.clientY - element.offsetTop;
            return [relativeX - centerX, centerY - relativeY];
        }
        on("mousedown", e => {
            e.preventDefault();
            this.rotateStart(...calcXY(e));
        });
        on("mousemove", e => {
            if (!this.rotating) return;
            e.preventDefault();
            this.rotateMove(...calcXY(e));
        });
        on("mouseup", e => {
            e.preventDefault();
            this.rotateStop();
        });
    }

    /**
     * Initializes the rotation process.
     * Important: X and Y are values relative to the center of the object positive to top-right.
     * @param {number} x X value of current position
     * @param {number} y Y value of current position
     */
    rotateStart(x, y) {
        this.rotating = true;
        this._rotationStart = this.currentAlpha;
        this._userRotationStart = this._calcAlpha(x, y);
    }
    /**
     * Rotates to the specified X and Y values relative to the starting position. Only works if rotateStart was called before.
     * Important: X and Y are values relative to the center of the object positive to top-right.
     * @param {number} x X value of current position
     * @param {number} y Y value of current position
     */
    rotateMove(x, y) {
        if (!this.rotating) return;

        this.currentAlpha = (this._calcAlpha(x, y) - this._userRotationStart + this._rotationStart) % 360;
        this.rotationHandlers.forEach(h => h.call(this, this.currentAlpha));
    }
    /**
     * Stops the rotation process.
     */
    rotateStop() {
        this.rotating = false;
        this._rotationStart = 0;
        this._userRotationStart = 0;
    }
    /**
     * Calc the alpha relative to center point.
     * @param {number} x
     * @param {number} y
     * @returns {number} Calculated alpha value
     * @private
     */
    _calcAlpha(x, y) {
		let a = 180 * Math.atan(y / x) / Math.PI;
		if (!this._isPos(x) && !this._isPos(y)) a = a + 180;
		else if (!this._isPos(x) && this._isPos(y)) a += 180;
        else if (this._isPos(x) && !this._isPos(y)) a += 360;
        return a;
    }
    /**
     * Check if number is positive.
     * @param {number} num
     * @returns {boolean} If number is positive
     * @private
     */
    _isPos(num) {
        return num == Math.abs(num);
    }

    /**
     * Add a new rotation handler to the list. Will be executed when the element is rotated.
     * @param {(this: Rotator, alpha: number) => void} func Event handler
     */
    addRotationHandler(func) {
        this.rotationHandlers.push(func);
    }
    /**
     * Removes a rotation handler from the list.
     * @param {(this: Rotator, alpha: number) => void} func Event handler
     */
    removeRotationHandler(func) {
        const index = this.rotationHandlers.indexOf(func);
        if (index > -1) this.rotationHandlers.splice(index, 1);
    }

    /**
     * Add all events to the specified element.
     * @param {HTMLElement|string} element The element to use
     * @returns {Rotator} The generated rotator
     */
    static hookToElement(element) {
        if (typeof element == "string") {
            element = document.getElementById(element) || document.querySelector(element);
        }

        const rotator = new Rotator();
        rotator.touchEvents(element);
        rotator.mouseEvents(element);

        rotator.addRotationHandler(alpha => {
            element.style.transform = `rotate(${(0 - alpha).toFixed(2)}deg)`;
            element.style.transformOrigin = "center center";
        });

        return rotator;
    }
}
