const adsSchema = new mongoose.Schema(
    {
      adsTitle: {
        type: String,
        required: true,
      },
      adsBody: {
        type: String,
        required: true,
      },
      adsLink: {
        type: String,
        match: [/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/, "Invalid URL format"],
      },
      active: {
        type: Boolean,
        default: false,
      },
      durationDays: {
        type: Number,
        default: 0,
        required: true,
      },
      expireAt: {
        type: Date,
        default: function () {
          return new Date(Date.now() + this.durationDays * config.duration_checker);
        },
      },
    },
    { timestamps: true }
  );
  
  const Advertisement = mongoose.model("Advertisement", adsSchema);
  module.exports = Advertisement;
  