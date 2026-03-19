export const getStorageData = (key: string, initialData: any[]) => {
  if (typeof window === "undefined") return initialData;
  const data = localStorage.getItem(`azevedo_${key}`);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      return initialData;
    }
  }
  
  // Initialize with initialData if empty
  localStorage.setItem(`azevedo_${key}`, JSON.stringify(initialData));
  return initialData;
};

export const setStorageData = (key: string, data: any[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(`azevedo_${key}`, JSON.stringify(data));
};

export const addStorageItem = (key: string, item: any) => {
  if (typeof window === "undefined") return item;
  const data = getStorageData(key, []);
  const newData = [item, ...data];
  setStorageData(key, newData);
  return item;
};

export const updateStorageItem = (key: string, id: string, updates: any) => {
  if (typeof window === "undefined") return null;
  const data = getStorageData(key, []);
  const index = data.findIndex((item: any) => item.id === id);
  if (index !== -1) {
    data[index] = { ...data[index], ...updates };
    setStorageData(key, data);
    return data[index];
  }
  return null;
};

export const deleteStorageItem = (key: string, id: string) => {
  if (typeof window === "undefined") return false;
  const data = getStorageData(key, []);
  const newData = data.filter((item: any) => item.id !== id);
  setStorageData(key, newData);
  return true;
};
