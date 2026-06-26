function generatePixPayload(pixKey, merchantName, merchantCity, amount, txid = "***") {
  const formatLength = (val) => val.length.toString().padStart(2, '0');
  const payloadFormat = "000201";
  const merchantAccountInfo = `0014br.gov.bcb.pix01${formatLength(pixKey)}${pixKey}`;
  const merchantAccountInfoBlock = `26${formatLength(merchantAccountInfo)}${merchantAccountInfo}`;
  const merchantCategoryCode = "52040000";
  const transactionCurrency = "5303986";
  const amountStr = amount.toFixed(2);
  const transactionAmount = `54${formatLength(amountStr)}${amountStr}`;
  const countryCode = "5802BR";
  const merchantNameBlock = `59${formatLength(merchantName)}${merchantName}`;
  const merchantCityBlock = `60${formatLength(merchantCity)}${merchantCity}`;
  const additionalData = `05${formatLength(txid)}${txid}`;
  const additionalDataBlock = `62${formatLength(additionalData)}${additionalData}`;
  let payload = payloadFormat + merchantAccountInfoBlock + merchantCategoryCode + transactionCurrency + transactionAmount + countryCode + merchantNameBlock + merchantCityBlock + additionalDataBlock + "6304";
  let crc = 0xFFFF;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
      else crc = (crc << 1) & 0xFFFF;
    }
  }
  return payload + crc.toString(16).toUpperCase().padStart(4, '0');
}
console.log(generatePixPayload("b9d06bed-a343-4c04-9cb1-67b50cac0c6e", "YURI MARCOS", "SAO PAULO", 150.00, "OS123"));
