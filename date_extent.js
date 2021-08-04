Date.prototype.epoch = function(set)
{
	if (set === undefined) {
		return parseInt(this.getTime() / 1000);
	}
	this.setTime(set * 1000);
}

Date.prototype.addUTCHours = function(hours)
{
	this.setUTCHours(this.getUTCHours() + hours);
}

Date.prototype.snapHours = function(divisible_by, up_down)
{
	if (up_down === undefined) up_down = 0;
	divisible_by = divisible_by * 3600;
	let epoch = this.epoch();

	let lower_sec = epoch - (epoch % divisible_by);
	let upper_sec = lower_sec + divisible_by;

	if (up_down == 0) { //Snap to closest
		up_down = (epoch - lower_sec < upper_sec - epoch) ? -1 : +1;
	} 
	if (up_down > 0) this.epoch(upper_sec); //UP
	else this.epoch(lower_sec); //DOWN
}

Date.prototype.stringFormat = function(format)
{
	let out = format;
	out = out.replace('timestamp', 'YYYY-MM-DD hh:mm:ss');
	out = out.replace('DD', ('0'+this.getUTCDate()).slice(-2));
	out = out.replace('d', this.getUTCDate());
	out = out.replace('MM', ('0'+(this.getUTCMonth()+1)).slice(-2));
	out = out.replace('mon', Array('jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'avg', 'sep', 'okt', 'nov', 'dec')[this.getUTCMonth()]);
	out = out.replace('Mon', Array('Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Avg', 'Sep', 'Okt', 'Nov', 'Dec')[this.getUTCMonth()]);
	out = out.replace('YYYY', this.getUTCFullYear());
	out = out.replace('hh', ('0'+this.getUTCHours()).slice(-2));
	out = out.replace('mm', ('0'+this.getUTCMinutes()).slice(-2));
	out = out.replace('ss', ('0'+this.getUTCSeconds()).slice(-2));

	return out;
}