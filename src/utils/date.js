export default {
  formatDate(date) {
    // 格式化日期为 'YYYY-MM-DD' 格式的字符串
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  },
};
