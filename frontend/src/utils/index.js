export const truncateMidText = (text) => {
  return String(text).slice(0, 4) + "..." + String(text).slice(text.length - 4);
};

// convert from big number
export const formatBigNumber = (num) => {
  const ERC20_DECIMALS = 18;

  if (!num) return;
  return num.shiftedBy(-ERC20_DECIMALS).toFixed(2);
};

export const formatName = (name) => {
  // replace all spaces with %20
  return encodeURI(name);
};

// object to convert to file
export const convertObjectToFile = (data) => {
  const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
  const files = [new File([blob], `${data.name}.json`)];
  return files;
};
