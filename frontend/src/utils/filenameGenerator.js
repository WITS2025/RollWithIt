export const generateFilename = (listData, extension) => {
  const base = listData?.title
    ? `${listData.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-packing-list`
    : 'packing-list';

  return `${base}.${extension}`;
};