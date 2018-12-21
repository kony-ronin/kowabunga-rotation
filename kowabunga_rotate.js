
/************************************
 *      Kowabunga Rotation          *
 *		Rotate UI Components        *
 * **********************************
 * Version: 1.0.0
 * 
 * Description:
 * A simple utility function to rotate your widgets with a linear animation while not having to go through the hastle of configuring a multi-step animation yourself. This function
 * will dinamically generate all the animation steps needed to do your rotation and proportionally assign each a part of the duration you specify.
 *  
 *  * Signature:
 * 		rotate(widget, degrees, clockwise, duration, configuration, callbacks)
 * 
 * Input Parameters:
 * 		Widget widget: Mandatory. Any UI component in the Kony API that supports a <widget>.animate() call.
 * 		Numeric (Unsigned) degrees: Mandatory. The target rotation in degrees.
 * 		Boolean clockwise: Mandatory. Whether or not the rotation should be clockwise. If not, the rotation will be counter-clockwise.
 * 		Numeric duration: The duration of the rotation in seconds. If specified it will override the duration of the Config Object.
 * 		Config Object (Optional): The object containing the duration, delay, iterationCount, direction and fillMode properties passed as the second argument of a
 * 		standard <widget>.animate(animation, config, callbacks) call. If not specified it will default to:
 * 			duration: 1 second
 * 			delay: 0 seconds
 * 			iterationCount: 1
 * 			direction: None
 * 			fillMode: Forwards
 * 		Callbacks Object (Optional): The object containing the callbacks for a <widget>.animate() call. If not specified it will default to an empty callbacks object
 * 
 * Important Note:
 * Rotations in the Kony API are not defined as Deltas, but as absolute angles -i.e. They are interpreted as "Rotate to x angle", as oppossed to "Rotate by x degrees".
 * As of now there is no way to tap into a widgets current rotation from the API, so it is up to you to remember the current angle/rotation of your widgets so you won't call this
 * function when the current and target angles are the same. Calling this function to rotate to the current angle will cause strange behaviour.
 * 
 * Implementation Details:
 * The function can't remember the current rotation of all the widgets it has been used on and remain elegantly reusable. If you need such behaviour consider wrapping a call to this
 * function from a closure of your own which will remember the current rotations of your widgets.
 * 
 * Author: Miguelangel Fernandez, miguelangel.fernandez@kony.com
 * 
 */

var rotate = (function(){

	var BREAK_POINT = 90;
	var stepConfig = {timingFunction: kony.anim.LINEAR};
	
	var DEFAULT_CONFIG = {
		duration: 1,
		delay: 0,
		iterationCount: 1,
		direction: kony.anim.DIRECTION_NONE,
		fillMode: kony.anim.FILL_MODE_FORWARDS
	};
	
	var DEFAULT_CALLBACKS = {animationEnd: function(){}};
	
	function _rotate(widget, deg, clockwise, config, callbacks){
		
		//Calculate how much time should the rotation of each degree last.
		var tick = 100 / deg;
		kony.print("tick:"+tick);
		
		var steps = {};
		var stepKey = 0;

		var sign = 1;
		clockwise? sign = -1: sign = 1;

		var absRotation = 0;
	
		//Calculate each step.
		do{
			var rotation = Math.min(deg, BREAK_POINT); //Calculate partial rotation for this step.
			deg = deg - BREAK_POINT; //Calculate how much pending rotation will be left after this step.
			
			//Prepare transformation with rotation degrees.
			var xfrm = kony.ui.makeAffineTransform();
			absRotation += sign * rotation;
			xfrm.rotate(absRotation);
			
			//Calculate the key for this step. 
			if(deg > 0){ 
				stepKey += Math.floor(tick * rotation);
			}
			else{ //If this is the last step, the key must be 100.
				stepKey = 100;
			}
			//console.log("key: %s, rotation: %s, absRotation: %s, deg: %s ", stepKey, rotation, absRotation, deg);
			//Add the step to the steps object.		
			steps[stepKey] = {
				transform: xfrm,
				stepConfig: stepConfig
			};
		}while(deg > 0);
		
		kony.print(steps);
		var anim = kony.ui.createAnimation(steps);
		
		widget.animate(anim, config, callbacks);
	}
	
	return function(widget, deg, clockwise, duration, _config, _callbacks){
		kony.print("deg: " + deg + ", clockwise: " + clockwise);
		var config, callbacks;
		_config? config = _config: config = DEFAULT_CONFIG;
		_callbacks? callbacks = _callbacks: callbacks = DEFAULT_CALLBACKS;
		
		if(typeof duration == 'number' && !isNaN(duration) && isFinite(duration)){
			config.duration = duration;
		}
		
		_rotate(widget, deg, clockwise, config, callbacks);
	};
})()
