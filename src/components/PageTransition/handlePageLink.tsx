
export const handlePageLink = (e: React.MouseEvent, path: string, navigate: any) => {
    e.preventDefault();
    if(path.startsWith('/#'))
      return;
    if(path.startsWith('/http://') || path.startsWith('/https://')) {
      window.open(path.substring(1), '_blank');
      return;
    }

    if(window.location.pathname != path)
      window.dispatchEvent(new Event('app:nav-start'));
    
    // Chờ 50ms để hiệu ứng bắt đầu trước khi trình duyệt bận xử lý render trang mới
    setTimeout(() => {
      navigate(path);
    }, 0);
};