import { test,expect } from '@playwright/test';
import { mkdirSync,writeFileSync } from 'node:fs';

const credentials={email:'admin@thepviet.vn',password:'ThepViet@2026'};
async function login(page){await page.goto('/admin/dang-nhap');await page.getByLabel('Email',{exact:true}).fill(credentials.email);await page.getByLabel('Mật khẩu',{exact:true}).fill(credentials.password);await page.getByRole('button',{name:'Đăng nhập',exact:true}).click();await expect(page).toHaveURL(/\/admin$/);}

test('Authentication, validation, stock transactions and protected deletion',async({request})=>{
 expect((await request.get('/api/admin/products')).status()).toBe(401);
 expect((await request.post('/api/auth/login',{data:{...credentials,password:'incorrect'}})).status()).toBe(401);
 expect((await request.post('/api/auth/login',{data:credentials})).ok()).toBeTruthy();
 expect((await request.post('/api/admin/products',{data:{name:'Invalid'}})).status()).toBe(400);
 expect((await request.post('/api/admin/products',{headers:{origin:'https://foreign.example'},data:{}})).status()).toBe(403);
 const products=await (await request.get('/api/admin/products')).json();const p=products.find(p=>p.id===1);const customer=(await (await request.get('/api/admin/customers')).json())[0];
 const created=await request.post('/api/admin/orders',{data:{customerId:customer.id,items:[{productId:p.id,quantity:20}],note:'Kiểm thử tự động'}});expect(created.status()).toBe(201);const order=await created.json();expect(order.total).toBe(p.price*20);
 for(let i=0;i<2;i++)expect((await request.patch('/api/admin/orders/'+order.id,{data:{status:'completed'}})).ok()).toBeTruthy();
 expect((await (await request.get('/api/admin/products')).json()).find(x=>x.id===p.id).stock).toBe(p.stock-20);
 expect((await request.patch('/api/admin/orders/'+order.id,{data:{status:'cancelled'}})).ok()).toBeTruthy();
 expect((await (await request.get('/api/admin/products')).json()).find(x=>x.id===p.id).stock).toBe(p.stock);
 const tooLarge=await (await request.post('/api/admin/orders',{data:{customerId:customer.id,items:[{productId:p.id,quantity:10},{productId:p.id,quantity:p.stock}],note:''}})).json();
 expect((await request.patch('/api/admin/orders/'+tooLarge.id,{data:{status:'completed'}})).status()).toBe(400);
 expect((await (await request.get('/api/admin/products')).json()).find(x=>x.id===p.id).stock).toBe(p.stock);
 expect((await request.delete('/api/admin/products/'+p.id)).status()).toBe(409);
 expect((await request.delete('/api/admin/customers/'+customer.id)).status()).toBe(409);
 expect((await request.post('/api/auth/logout')).ok()).toBeTruthy();
 expect((await request.get('/api/admin/orders')).status()).toBe(401);
});

test('Public navigation, product filters and quote sent through to admin',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await page.getByRole('link',{name:'Khám phá sản phẩm',exact:true}).click();
 await page.getByRole('button',{name:'Thép hình',exact:true}).click();await expect(page.locator('.catalog-card')).toHaveCount(2);
 await page.getByRole('textbox',{name:'Tìm sản phẩm'}).fill('Thép hình H');await expect(page.locator('.catalog-card')).toHaveCount(1);
 await page.locator('.catalog-card').getByRole('button',{name:'Nhận báo giá'}).click();
 const dialog=page.getByRole('dialog');await expect(dialog.getByLabel('Sản phẩm quan tâm')).toHaveValue('Thép hình H');
 await dialog.getByLabel('Họ và tên *').fill('Khách kiểm thử báo giá');await dialog.getByLabel('Số điện thoại *').fill('0909998887');await dialog.getByLabel('Khối lượng dự kiến').fill('3 tấn');await dialog.getByLabel('Yêu cầu thêm').fill('Giao tại Đồng Nai.');
 await dialog.getByRole('button',{name:'Gửi yêu cầu báo giá'}).click();await expect(dialog.getByRole('heading',{name:'Yêu cầu đã được gửi!'})).toBeVisible();await dialog.getByRole('button',{name:'Hoàn tất'}).click();
 await login(page);await page.goto('/admin/bao-gia');await page.getByRole('textbox',{name:'Tìm tên, số điện thoại, sản phẩm…'}).fill('Khách kiểm thử báo giá');
 await page.locator('tbody tr').getByRole('button').click();await expect(page.getByRole('dialog')).toContainText('Giao tại Đồng Nai.');
 await page.getByLabel('Trạng thái xử lý').selectOption('contacted');await page.getByRole('button',{name:'Lưu cập nhật'}).click();await expect(page.locator('tbody tr')).toContainText('Đã liên hệ');
 expect(errors).toEqual([]);
});

test('Product and customer CRUD, persistent update and CSV download',async({page})=>{
 await login(page);await page.goto('/admin/san-pham');await page.getByRole('button',{name:'Thêm sản phẩm',exact:true}).click();
 await page.getByLabel('Tên sản phẩm *').fill('Thép kiểm thử');await page.getByLabel('Mã sản phẩm *').fill('TEST-STEEL');await page.getByLabel('Đơn giá (VNĐ) *').fill('16000');await page.getByLabel('Tồn kho *').fill('500');await page.getByLabel('Quy cách *').fill('D16');await page.getByLabel('Mô tả *').fill('Sản phẩm dùng để kiểm tra chức năng CRUD.');await page.getByRole('button',{name:'Lưu sản phẩm'}).click();
 await expect(page.getByRole('dialog')).toHaveCount(0);await page.getByRole('textbox',{name:'Tìm tên, mã sản phẩm…'}).fill('TEST-STEEL');await expect(page.locator('tbody tr')).toHaveCount(1);
 await page.getByRole('button',{name:'Sửa Thép kiểm thử',exact:true}).click();await page.getByLabel('Tồn kho *').fill('650');await page.getByRole('button',{name:'Lưu sản phẩm'}).click();await expect(page.getByRole('dialog')).toHaveCount(0);await page.reload();await page.getByRole('textbox',{name:'Tìm tên, mã sản phẩm…'}).fill('TEST-STEEL');await expect(page.locator('tbody tr')).toContainText('650');
 const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Xuất CSV'}).click();expect((await downloadPromise).suggestedFilename()).toBe('san-pham.csv');
 await page.getByRole('button',{name:'Xóa Thép kiểm thử',exact:true}).click();await page.getByRole('button',{name:'Xóa bản ghi'}).click();await expect(page.getByRole('dialog')).toHaveCount(0);await expect(page.getByText('Không tìm thấy kết quả')).toBeVisible();
 await page.goto('/admin/khach-hang');await page.getByRole('button',{name:'Thêm khách hàng',exact:true}).click();await page.getByLabel('Họ và tên *').fill('Khách CRUD');await page.getByLabel('Số điện thoại *').fill('0911223344');await page.getByRole('button',{name:'Lưu khách hàng'}).click();await expect(page.getByRole('dialog')).toHaveCount(0);
 await page.getByRole('button',{name:'Sửa Khách CRUD',exact:true}).click();await page.getByLabel('Công ty',{exact:true}).fill('Công ty Kiểm thử');await page.getByRole('button',{name:'Lưu khách hàng'}).click();await expect(page.getByRole('dialog')).toHaveCount(0);await expect(page.getByText('Công ty Kiểm thử')).toBeVisible();
 await page.getByRole('button',{name:'Xóa Khách CRUD',exact:true}).click();await page.getByRole('button',{name:'Xóa bản ghi'}).click();await expect(page.getByRole('dialog')).toHaveCount(0);await expect(page.getByText('Khách CRUD',{exact:true})).toHaveCount(0);
});

test('Order creation and status changes through UI',async({page})=>{
 await login(page);await page.goto('/admin/don-hang?tao=1');await expect(page.getByRole('dialog')).toBeVisible();await page.getByLabel('Khách hàng *').selectOption({index:1});await page.getByRole('combobox',{name:'Sản phẩm 1'}).selectOption({index:1});await page.getByRole('spinbutton',{name:'Số lượng 1'}).fill('100');await page.getByLabel('Ghi chú').fill('Đơn hàng tạo qua trình duyệt');await page.getByRole('dialog').getByRole('button',{name:'Tạo đơn hàng',exact:true}).click();await expect(page.getByRole('dialog')).toHaveCount(0);
 await page.locator('tbody tr').first().getByRole('button',{name:/Xem đơn hàng/}).click();await expect(page.getByRole('dialog')).toContainText('Đơn hàng tạo qua trình duyệt');await page.getByLabel('Cập nhật trạng thái').selectOption('completed');await page.getByRole('button',{name:'Lưu trạng thái'}).click();await expect(page.getByRole('dialog')).toHaveCount(0);await expect(page.locator('tbody tr').first()).toContainText('Hoàn tất');
});

test('Company settings propagate to public website',async({page})=>{
 await login(page);await page.goto('/admin/cai-dat');await page.getByLabel('Tên doanh nghiệp *').fill('Thép Việt Kiểm Thử');await page.getByLabel('Khẩu hiệu *').fill('Thép tốt cho mọi công trình');await page.getByRole('button',{name:'Lưu thay đổi'}).click();await expect(page.getByText('Đã cập nhật thông tin doanh nghiệp trên website.')).toBeVisible();await page.goto('/');await expect(page.locator('.site-header .brand strong')).toHaveText('Thép Việt Kiểm Thử');await expect(page.locator('.footer-bottom')).toContainText('Thép tốt cho mọi công trình');await page.goto('/admin/cai-dat');await page.getByLabel('Tên doanh nghiệp *').fill('Thép Việt');await page.getByLabel('Khẩu hiệu *').fill('Vững nền móng, bền tương lai');await page.getByRole('button',{name:'Lưu thay đổi'}).click();await expect(page.getByText('Đã cập nhật thông tin doanh nghiệp trên website.')).toBeVisible();
});

test('Responsive typography, all routes and accessible modal at six viewport widths',async({page},testInfo)=>{
 test.setTimeout(120000);const errors=[];page.on('pageerror',e=>errors.push(e.message));const measurements=[];const folder=testInfo.outputPath('responsive');mkdirSync(folder,{recursive:true});
 for(const width of [360,390,768,1366,1920,2560]){
  await page.setViewportSize({width,height:width<700?844:1000});await page.goto('/');await page.getByRole('heading',{level:1}).waitFor();await page.evaluate(()=>document.fonts.ready);
  const metrics=await page.evaluate(()=>{const size=s=>parseFloat(getComputedStyle(document.querySelector(s)).fontSize);return {width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth,heading:size('h1'),body:size('.hero-copy>p'),button:size('.hero-actions .button'),card:size('.category-body h3')};});measurements.push(metrics);expect(metrics.overflow).toBe(false);await page.screenshot({path:folder+'/home-'+width+'.png',fullPage:true});
  await page.getByRole('button',{name:'Nhận báo giá',exact:true}).click();await expect(page.getByRole('dialog')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);
  if(width<960){await page.getByRole('button',{name:'Mở menu',exact:true}).click();await expect(page.getByRole('navigation',{name:'Điều hướng chính'})).toBeVisible();await page.getByRole('navigation',{name:'Điều hướng chính'}).getByRole('link',{name:'Sản phẩm',exact:true}).click();await expect(page).toHaveURL(/san-pham/);}
  for(const route of ['/san-pham','/gioi-thieu','/du-an','/lien-he']){await page.goto(route);await page.getByRole('heading',{level:1}).waitFor();expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),route+' width '+width).toBe(false);}
 }
 for(let i=4;i<measurements.length;i++){for(const role of ['heading','body','button','card'])expect(measurements[i][role]).toBeGreaterThan(measurements[i-1][role]);}
 await login(page);
 for(const width of [360,390,768,1366,1920,2560]){
  await page.setViewportSize({width,height:width<700?844:1000});await page.goto('/admin');await page.getByText('Doanh thu theo tháng').waitFor();await page.screenshot({path:folder+'/admin-'+width+'.png',fullPage:true});expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  if(width<640){await page.getByRole('button',{name:'Mở menu quản trị'}).click();await page.getByRole('navigation',{name:'Điều hướng quản trị'}).getByRole('link',{name:'Sản phẩm',exact:true}).click();await expect(page).toHaveURL(/san-pham/);}
  for(const route of ['/admin/san-pham','/admin/don-hang','/admin/khach-hang','/admin/bao-gia','/admin/cai-dat']){await page.goto(route);await page.getByRole('heading',{level:1}).waitFor();expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),route+' width '+width).toBe(false);}
 }
 writeFileSync(folder+'/typography.json',JSON.stringify(measurements,null,2));console.log('Typography metrics:',JSON.stringify(measurements));expect(errors).toEqual([]);
});
