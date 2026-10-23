import { HttpInterceptorFn } from '@angular/common/http';

export const headerInterceptor: HttpInterceptorFn = (req, next) => {


  const excludedUrl = 'https://www.plutuscloudservice.in:8201/API/CloudBasedIntegration/V1/UploadBilledTransaction'; // Change this to your API

  if (req.url.includes(excludedUrl)) {
    return next(req); // Pass the request without modification
  }

else{
  const modifiedReq = req.clone({ 
    setHeaders: {
      'Accept': '*/*',
      'apitoken': '12345',
      'Content-Type':'application/json'
    }
  });
  return next(modifiedReq);
}
   
 
};
