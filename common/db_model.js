Participants = function (data) {
    this.vehicleColor = data.vehicleColor || 0;
    this.secMark = data.secMark || 0;
    this.heading = data.heading || 0;
    this.accuracy = data.accuracy || "";
    this.source = data.source || 0;
    this.plateNum = data.plateNum || "";
    this.speed = data.speed || 0;
    this.plateColor = data.plateColor || 0;
    this.size = {
      length: data.size.length || 0,
      width: data.size.width || 0,
      height: data.size.height || 0
    };
    this.pos = {
      lon: data.pos.lon || 0,
      lat: data.pos.lat || 0,
      ele: data.pos.ele || 0
    };
    this.vehicleModel = data.vehicleModel || "";
    this.vehicleClass = data.vehicleClass || 0;
    this.ptcId = data.ptcId || 0;
    this.ptcType = data.ptcType || 0;
    this.timestamp = data.timestamp || 0;
};

module.exports.participantsSchema = {
    vehicleColor: { type: Number },
    secMark: { type: Number },
    heading: { type: Number },
    accuracy: { type: String },
    source: { type: Number },
    plateNum: { type: String },
    speed: { type: Number },
    plateColor: { type: Number },
    size: {
      length: { type: Number },
      width: { type: Number },
      height: { type: Number }
    },
    pos: {
      lon: { type: Number },
      lat: { type: Number },
      ele: { type: Number }
    },
    vehicleModel: { type: String },
    vehicleClass: { type: Number },
    ptcId: { type: Number },
    ptcType: { type: Number },
    timestamp: { type: Number }
};

Rsms = function(obj) {
    this.refPos = obj.refPos;
    this.participants = obj.participants;
};

module.exports.rsmsSchema = {
    refPos: {
      lon: { type: Number },
      lat: { type: Number },
      ele: { type: Number }
    },
    participants: {type: Array}
};


RSMDataObj = function(obj) {
  this.type = obj.type; //obj.type;
  this.data = obj.data; //obj.data;
};

module.exports.RSMDataObjSchema = {
    type: { 
        type: String //,
        // validate: {
        //     validator: function(v) {
        //       return v === "14";
        //     },
        //     message: 'type must be 14'
        //     }
        },
    data: {
        mecEsn: { type: String}, // ,required: true
        rsms: {type: Array}, // , required: true
        timestamp: {type: Number}
    }
};

EventRSMDataObj = function(obj) {
  this.type = obj.type; //obj.type;
  this.data = obj.data; //obj.data;
  this.event_id = obj.event_id
};

module.exports.EventRSMDataObjSchema = {
    type: { type: String },
    data: {
        mecEsn: { type: String}, // ,required: true
        rsms: {type: Array}, // , required: true
        timestamp: {type: Number}
    },
    event_id: { type: Number}
};

// module.exports.RSMDataObjSchema = Joi.object({
//     type: Joi.string().valid('14').required(),
//     data: Joi.object({
//         mecEsn: Joi.string().required(),
//         rsms: Joi.array().required(),
//         timestamp: {type: Number}
//     })
// });


// type = 1
type_1 = function () {
  this.type = ""; // obj.type;
  this.data = {}; // obj.data;
};

module.exports.type_1_Schema = {
  type: {type: String},
  data: {
    vid: {type: String},
    latitude: {type: Number},
    longitude: {ype: Number},
    heading: {type: Number},
    speed: {type: Number},
    vlicense: {type: String},
    category: {type: Array}
  }
};