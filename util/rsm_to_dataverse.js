const fs = require('fs');
const csv = require('csv-parser');
const { wgs84_to_gcj02 } = require('./gps_encoding');
const pymap3d = require('pymap3d');

const COLUMN_NAME = ['ID','Time','PositionX','PositionY','PositionZ','Length','Width','Height','Yaw','Pitch','Roll',
                'VX','VY','VZ','AX','AY','AZ','Category','Style','Color','Ego'];
const CATEGORY_MAP0 = {1:"小车", 2:"货车", 3:"机动车", 4:"非机动车", 5:"行人", 6:"二轮车", 7:"三轮车", 8:"公交车", 9:"大巴(货车)"};

const CATEGORY_MAP1 = {1:"car", 2:"truck", 3:"机动车", 4:"非机动车", 5:"man", 6:"normal", 7:"tricycle", 8:"coach", 9:"van_truck"};
const CATEGORY_MAP2 = {1:"vehicle", 2:"vehicle", 3:"机动车", 4:"非机动车", 5:"pedestrian", 6:"bike", 7:"vehicle", 8:"vehicle", 9:"vehicle"};
const STYLE_MAP = {"car":"vehicle", "mixed_truck":"vehicle", "truck":"vehicle", "coach":"vehicle", "van_truck":"vehicle", "tricycle":"vehicle", "motor":"vehicle",
                 "electric":"bike", "normal":"bike",
                 "man":"pedestrian", "woman":"pedestrian", "child":"pedestrian",
                 "dog":"animal",
                 "unknown": "unknown"
                };
const COLOR_MAP = {0:'white',1:'gray',3:'yellow',4:'pink',5:'purple',6:'green',7:'blue',8:'red',9:'brown',10:'orange',11:'black'};

module.exports.convert_files = function convert_files(files, output_file) {
    if (files === null) {
        return;
    }
    let data_frames = [];
    for (let i = 0; i < files.length; i++) {
        let file = JSON.parse(fs.readFileSync(files[i]));
        let data = file.data;
        let timestamp = data.timestamp;
        let refPos = data.rsms.refPos;
        let lon = refPos.lon;
        let lat = refPos.lat;
        let participants = data.rsms.participants;
        for (let j = 0; j < participants.length; j++) {
            let participant = participants[j];
            let ptcId = participant.ptcId;
            let pos = participant.pos;
            let ptcType = participant.ptcType;
            let vehicleColor = participant.vehicleColor;
            let size = participant.size;
            let heading = participant.heading;
            let speed = participant.speed;

            let row = {
                'ID': ptcId,
                'Time': timestamp,
                'PositionX': pos.lon,
                'PositionY': pos.lat,
                'PositionZ': pos.alt,
                'Length': size.length,
                'Width': size.width,
                'Height': size.height,
                'Yaw': heading,
                'Pitch': 0.0,
                'Roll': 0.0,
                'VX': 0.0,
                'VY': 0.0,
                'VZ': 0.0,
                'AX': 0.0,
                'AY': 0.0,
                'AZ': 0.0,
                'Category': ptcType,
                'Style': ptcType,
                'Color': vehicleColor,
                'Ego': 'N'
            };
            data_frames.push(row);
        }
    }

    let df = csv.parse(data_frames, {
        headers: true,
        skipLines: 0
    });
    df.sort((a,b) => a['Time'] - b['Time']);

    let origin_gps_point = [23.023899623618, 113.488177461743, 0.0];
    for (let i = 0; i < df.length; i++) {
        let row = df[i];
        let lon = row['PositionX'];
        let lat = row['PositionY'];
        let [gcj02_lat, gcj02_lon] = wgs84_to_gcj02(lat, lon);
        let [posX, posY, posZ] = pymap3d.geodetic2enu(gcj02_lat, gcj02_lon, 0.0, origin_gps_point[0], origin_gps_point[1], 0.0);
        row['PositionX'] = posX;
        row['PositionY'] = posY;
        row['PositionZ'] = posZ;

        row['Time'] = row['Time'] / 1000;
        row['Length'] = row['Length'] / 100;
        row['Width'] = row['Width'] / 100;
        row['Height'] = row['Height'] / 100;
        row['Yaw'] = row['Yaw'] * 0.0125;
        row['speed'] = row['speed'] * 0.02;

        row['Category'] = CATEGORY_MAP2[row['Category']];
        row['Style'] = STYLE_MAP[row['Style']];
        row['vehicleColor'] = COLOR_MAP[row['Color']];
        row['VX'] = row['speed'] * Math.cos(Math.radians(row['Yaw']));
        row['VY'] = row['speed'] * Math.sin(Math.radians(row['Yaw']));

        delete row['Color'];
    }

    df = df.map(row => {
        return {
            'ID': row['ID'],
            'Time': row['Time'],
            'PositionX': row['PositionX'],
            'PositionY': row['PositionY'],
            'PositionZ': row['PositionZ'],
            'Length': row['Length'],
            'Width': row['Width'],
            'Height': row['Height'],
            'Yaw': row['Yaw'],
            'Pitch': row['Pitch'],
            'Roll': row['Roll'],
            'VX': row['VX'],
            'VY': row['VY'],
            'VZ': row['VZ'],
            'AX': row['AX'],
            'AY': row['AY'],
            'AZ': row['AZ'],
            'Category': row['Category'],
            'Style': row['Style'],
            'Color': row['vehicleColor'],
            'Ego': row['Ego']
        };
    });

    let csvData = COLUMN_NAME.join(',') + '\n';
    for (let i = 0; i < df.length; i++) {
        let row = df[i];
        let values = COLUMN_NAME.map(colName => row[colName]);
        csvData += values.join(',') + '\n';
    }

    fs.writeFileSync(output_file, csvData);
}