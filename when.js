'use strict';

// Date.parse with progressive enhancement for ISO 8601 <https://github.com/csnover/js-iso8601>
// © 2011 Colin Snover <http://zetafleet.com>
// Released under MIT license.
(function (Date, undefined) {
	var origParse = Date.parse, numericKeys = [ 1, 4, 5, 6, 7, 10, 11 ]
	Date.parse = function (date) {
		var timestamp, struct, minutesOffset = 0
		// ES5 §15.9.4.2 states that the string should attempt to be parsed as a Date Time String Format string
		// before falling back to any implementation-specific date parsing, so that’s what we do, even if native
		// implementations could be faster
		//              1 YYYY                2 MM       3 DD           4 HH    5 mm       6 ss        7 msec        8 Z 9 ±    10 tzHH    11 tzmm
		if ((struct = /^(\d{4}|[+\-]\d{6})(?:-(\d{2})(?:-(\d{2}))?)?(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{3}))?)?(?:(Z)|([+\-])(\d{2})(?::(\d{2}))?)?)?$/.exec(date))) {
			// avoid NaN timestamps caused by “undefined” values being passed to Date.UTC
			for (var i = 0, k; (k = numericKeys[i]); ++i) {
				struct[k] = +struct[k] || 0
			}
			// allow undefined days and months
			struct[2] = (+struct[2] || 1) - 1
			struct[3] = +struct[3] || 1
			if (struct[8] !== 'Z' && struct[9] !== undefined) {
				minutesOffset = struct[10] * 60 + struct[11]
				if (struct[9] === '+') {
					minutesOffset = 0 - minutesOffset
				}
			}
			timestamp = Date.UTC(struct[1], struct[2], struct[3], struct[4], struct[5] + minutesOffset, struct[6], struct[7])
		}
		else {
			timestamp = origParse ? origParse(date) : NaN
		}
		return timestamp
	}
}(Date))

class When
{
	constructor ( date )
	{
		if ( arguments.length > 1 ) throw 'too many arguments'
		this.date = date ?? new Date()
		if ( !this.date instanceof Date ) throw 'expecting Date type'
	}
	static parse ( s ) { return new When ( Date.parse ( s ) ) }
	static fromTime ( ms ) { return new When ( new Date ( ms ) ) }
	static fromParts ( y, mo, d, h, mi, s, ms )
	{
		return new When ( new Date ( y, mo, d, h, mi, s, ms ) )
	}
	toLocal() { return new When ( new Date ( this.getTime() ) ) }
	toUTC() { return new WhenUT ( new Date ( this.getTime() ) ) }
	valueOf() { return this.date.valueOf() } // milliseconds since 1970Jan01
	getTime() { return this.date.getTime() } // milliseconds since 1970Jan01
	getFullYear() { return this.date.getFullYear() }
	getMonth() { return this.date.getMonth() + 1 }
	getDate() { return this.date.getDate() }
	getHours() { return this.date.getHours() }
	getMinutes() { return this.date.getMinutes() }
	getSeconds() { return this.date.getSeconds() }
	getMilliseconds() { return this.date.getMilliseconds() }
	getTimezoneOffset() { return this.date.getTimezoneOffset() }
	getDOW() { return this.date.getDay() } // 0=Sun, 6=Sat
	setFullYear ( year )
	{
		let d = new Date ( this.getTime() )
		d.setFullYear ( year )
		return new When ( d )
	}
	setMonth ( month )
	{
		let d = new Date ( this.getTime() )
		d.setMonth ( month - 1 )
		return new When ( d )
	}
	setDate ( day )
	{
		let d = new Date ( this.getTime() )
		d.setDate ( day )
		return new When ( d )
	}
	setHours ( hours )
	{
		let d = new Date ( this.getTime() )
		d.setHours ( hours )
		return new When ( d )
	}
	setMinutes ( minutes )
	{
		let d = new Date ( this.getTime() )
		d.setMinutes ( minutes )
		return new When ( d )
	}
	setSeconds ( seconds )
	{
		let d = new Date ( this.getTime() )
		d.setSeconds ( seconds )
		return new When ( d )
	}
	setMilliseconds ( milliseconds )
	{
		let d = new Date ( this.getTime() )
		d.setMilliseconds ( milliseconds )
		return new When ( d )
	}
	to8601() { return this.format ( '%Y-%m-%dT%H:%M:%S.%f%z' ) }
	to822() { return this.format ( '%b %d %Y %H:%M:%S.%f %-z' ) }
	format ( fmt )
	{
		let local = !( this instanceof WhenUTC )
		let options = local ? {} : { 'timeZone': 'UTC' }
		let parts = fmt.split ( /(%-?.)/ )
		let tzoff = -this.getTimezoneOffset(), tz = 'Z', h
		if ( local && tzoff != 0 )
		{
			let tzh = Math.floor ( tzoff / 60 )
			let tzm = tzoff % ( tzh * 60 )
			let prefix = tzh > 0 ? '+' : '-'
			tzh = prefix + ( '0' + Math.abs ( tzh ) ).slice ( -2 )
			tzm = ( '0' + tzm ).slice ( -2 )
			tz = `${tzh}:${tzm}`
		}
		for ( let i = 1; i < parts.length; i += 2 )
		{
			switch ( parts[i] )
			{
			case '%a':
				parts[i] = this.date.toLocaleString ( 'default', Object.assign ( {}, options, { 'weekday': 'short' } ) )
				break
			case '%A':
				parts[i] = this.date.toLocaleString ( 'default', Object.assign ( {}, options, { 'weekday': 'long' } ) )
				break
			case '%b':
				parts[i] = this.date.toLocaleString ( 'default', Object.assign ( {}, options, { 'month': 'short' } ) )
				break
			case '%B':
				parts[i] = this.date.toLocaleString ( 'default', Object.assign ( {}, options, { 'month': 'long' } ) )
				break
			case '%d':
				parts[i] = ( '0' + this.getDate() ).slice ( -2 )
				break
			case '%-d':
				parts[i] = '' + this.getDate()
				break
			case '%f':
				parts[i] = ( '00' + this.getMilliseconds() ).slice ( -3 )
				break
			case '%-f':
				parts[i] = ( '00' + this.getMilliseconds() ).slice ( -3 ).replace ( /0+$/, '' )
				break
			case '%H':
				parts[i] = ( '0' + this.getHours() ).slice ( -2 )
				break
			case '%-H':
				parts[i] = '' + this.getHours()
				break
			case '%I':
				h = this.getHours()
				h = ( h + 11 ) % 12 + 1
				parts[i] = ( '0' + h ).slice ( -2 )
				break
			case '%-I':
				h = this.getHours()
				h = ( h + 11 ) % 12 + 1
				parts[i] = '' + h
				break
			case '%M':
				parts[i] = ( '0' + this.getMinutes() ).slice ( -2 )
				break
			case '%-M':
				parts[i] = '' + this.getMinutes()
				break
			case '%m':
				parts[i] = ( '0' + this.getMonth() ).slice ( -2 )
				break
			case '%-m':
				parts[i] = '' + this.getMonth()
				break
			case '%S':
				parts[i] = ( '0' + this.getSeconds() ).slice ( -2 )
				break
			case '%-S':
				parts[i] = '' + this.getSeconds()
				break
			case '%w':
				parts[i] = this.getDay()
				break
			case '%y':
				parts[i] = ( '0' + this.getYear() ).slice ( -2 )
				break
			case '%Y':
				parts[i] = '' + this.getFullYear()
				break
			case '%z':
				parts[i] = tz
				break
			case '%-z': // DEVIATION from strftime.org
				parts[i] = tz.replace ( ':', '' )
				break
			}
		}
		return parts.join ( '' )
	}
	add ( /* arguments = ... */ )
	{
		let d = new Date ( this.getTime() )
		for ( let i = 0; i < arguments.length; i += 2 )
		{
			let n = arguments[i]
			let which = arguments[i+1]
			switch ( ( '' + which ).toLowerCase() )
			{
			case 'year': case 'years':
				d.setFullYear ( d.getFullYear() + n )
				break;
			case 'month': case 'months':
				d.setMonth ( d.getMonth() + n )
				break;
			case 'day': case 'days':
				d.setDate ( d.getDate() + n )
				break;
			case 'hour': case 'hours':
				d.setHours ( d.getHours() + n )
				break;
			case 'minute': case 'minutes':
				d.setMinutes ( d.getMinutes() + n )
				break;
			case 'second': case 'seconds':
				d.setSeconds ( d.getSeconds() + n )
				break;
			case 'millisecond': case 'milliseconds':
				d.setMilliseconds ( d.getMilliseconds() + n )
				break;
			default:
				throw `invalid time unit: ${which}`
			}
		}
		return new this.constructor ( d )
	}
}

class WhenUTC extends When
{
	static parse ( s ) { return new WhenUTC ( Date.parse ( s ) ) }
	static fromTime ( ms ) { return new WhenUTC ( new Date ( ms ) ) }
	static fromParts ( y, mo, d, h, mi, s, ms )
	{
		return new WhenUTC ( new Date ( y, mo, d, h, mi, s, ms ) )
	}
	getFullYear() { return this.date.getUTCFullYear() }
	getMonth() { return this.date.getUTCMonth() + 1 }
	getDate() { return this.date.getUTCDate() }
	getHours() { return this.date.getUTCHours() }
	getMinutes() { return this.date.getUTCMinutes() }
	getSeconds() { return this.date.getUTCSeconds() }
	getMilliseconds() { return this.date.getUTCMilliseconds() }
	getDOW() { return this.date.getUTCDay() } // 0=Sun, 6=Sat
	setFullYear ( year )
	{
		let d = new Date ( this.getTime() )
		d.setUTCFullYear ( year )
		return new WhenUTC ( d )
	}
	setMonth ( month )
	{
		let d = new Date ( this.getTime() )
		d.setUTCMonth ( month - 1 )
		return new WhenUTC ( d )
	}
	setDate ( day )
	{
		let d = new Date ( this.getTime() )
		d.setUTCDate ( day )
		return new WhenUTC ( d )
	}
	setHours ( hours )
	{
		let d = new Date ( this.getTime() )
		d.setUTCHours ( hours )
		return new WhenUTC ( d )
	}
	setMinutes ( minutes )
	{
		let d = new Date ( this.getTime() )
		d.setUTCMinutes ( minutes )
		return new WhenUTC ( d )
	}
	setSeconds ( seconds )
	{
		let d = new Date ( this.getTime() )
		d.setUTCSeconds ( seconds )
		return new WhenUTC ( d )
	}
	setMilliseconds ( milliseconds )
	{
		let d = new Date ( this.getTime() )
		d.setUTCMilliseconds ( milliseconds )
		return new WhenUTC ( d )
	}
}