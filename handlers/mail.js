const nodemailer = require("nodemailer");
const pug = require("pug");
const juice = require("juice");
const htmlToText = require("html-to-text");
const promisify = require("es6-promisify");

const transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// transport.sendMail({
//   from: "Tereza <t.bastarova@gmail.com>",
//   to: "terb2686@gmail.com",
//   subject: "testing",
//   html: "You're utterly <strong>awesome!</strong>",
//   text: "You're utterly **awesome**!",
// });

const generateHTML = (filename, options = {}) => {
  const html = pug.renderFile(
    `${__dirname}/../views/email/${filename}.pug`,
    options
  );
  const inlined = juice(html);
  return inlined;
};

exports.send = async (options = {}) => {
  //options can be without specifying object, but Ter gets it better this way
  const html = generateHTML(options.filename, options);
  const text = htmlToText.fromString(html);

  const mailOptions = {
    from: `TerBa <noreply@terba.com`,
    to: options.user.email,
    subject: options.subject,
    html,
    text,
  };
  const sendMail = promisify(transport.sendMail, transport);
  return sendMail(mailOptions);
};
