'use strict';
var dbpool = require('../db.js');

var CurvePersistence = class CurvePersistence {
	constructor(){
		
	}

	static findById(id){
		var sql = `select * from curve where id=${id} and flag=0`;
		var wrap = function(rows){
			if(!rows || rows.length === 0){
				return "";
			}
			
			var row = rows[0];
			return {
				id: id,
				caption: row.caption,
				data: JSON.parse(row.data),
				series: JSON.parse(row.series)
			}
		}
		return new Promise(function(resolve, reject){
            dbpool.execute(sql, function(err, rows){
                resolve({
                    err: err,
                    curve: wrap(rows)
                });
            });
        })
	}
	static findByPropertyId(id){
		var sql = `select * from curve where property_id=${id} and flag=0`;
		var wrap = function(rows){
			if(!rows || rows.length === 0){
				return null;
			}
			
			var row = rows[0];
			return {
				id: id,
				caption: row.caption,
				data: JSON.parse(row.data),
				series: JSON.parse(row.series)
			}
		}
		return new Promise(function(resolve, reject){
            dbpool.execute(sql, function(err, rows){
                resolve({
                    err: err,
                    curve: wrap(rows)
                });
            });
        })
	}

	//curve client: 
	//undefined -- no need, 
	//{} --to be defined,  
	//{data:[], series:{}, chapter:''} --defined
	static isDefined(curve){
		if(curve != undefined && Object.keys(curve)!=0){
			return true;
		}
		return false;
	}
	static isNeed(curve){
		return !(curve == undefined);
	}
	static notNeed(curve){
		return (curve == undefined);	
	}
	static delete(propertyIds, conn){
		var propertyIdClause = propertyIds.join(',');
		var sql = `update curve set flag=1 where property_id in (${propertyIdClause})`;
		console.log(sql);
        return new Promise(function(resolve, reject){
        	dbpool.singleExecute(conn, sql, function(err, result) {
                if (err) {
                    var errmsg = sql + '\n' + err.stack;
                    reject(new Error(errmsg));
                    return;
                }
                resolve(result);
            });
        })
	}
	static insert(condition, conn){
		var curveClauses = condition.map(function(c){
			var curve = c.curve;
			var caption = curve.caption || "";
			var data = curve.data || 'NULL';
			var series = curve.series || 'NULL';
			var propertyId = c.propertyId;

			return `("${caption}", '${JSON.stringify(data)}', '${JSON.stringify(series)}', ${propertyId})`;
		})
		var curveClause = curveClauses.join(',');

		var sql = `insert into curve(
			caption, data, series, property_id
        ) values ${curveClause}`;

        console.log(sql);
        return new Promise(function(resolve, reject){
			dbpool.singleExecute(conn, sql, function(err, result) {
                if (err) {
                    var errmsg = sql + '\n' + err.stack;
                    reject(new Error(errmsg));
                    return;
                }
                resolve(result);
            });
        })
	}
}

module.exports = CurvePersistence;