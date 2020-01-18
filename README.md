# schoolproject

毕业设计项目

实现皮肤镜图像的分割、识别、属性检测


## 计划

|功能|完成程度|
|:-:|:-:|
|使用Python完成一张皮肤镜图像分割|已完成|
|使用Python完成一张皮肤镜图像识别|已完成|
|使用Python完成一张皮肤镜病变属性检测|已完成|
|使用Python完成一组皮肤镜图像分割|已完成|
|使用Python完成一组皮肤镜图像识别|已完成|
|使用Python完成一组皮肤镜病变属性检测|已完成|
|使用python完成基于mask图像对图像染色|已完成|
|写如何解决打包skimage库出现的bug|已完成|
|使用thrift构建RPC服务代码|已完成|
|将代码中涉及pillow库移除|已完成|
|学习Vue书籍|已完成|
|将python代码打包为可执行文件|*未完成*|
|完成论文目录构想|已完成|
|使用Python完成皮肤镜图像超分辨率重建|*未完成*|
|使用Vuex调用图像分割代码|已完成|
|使用Vuex用图像识别代码|已完成|
|使用Vuex调用图像属性检测代码|已完成|
|使用NodeJs调用图像超分辨率重建代码|*未完成*|
|使用Electron实现图像浏览功能|*未完成*|
|使用Electron实现导入一组图像功能|*未完成*|
|使用Electron实现导入图像预览功能|*未完成*|
|使用Electron实现浏览图像信息功能|*未完成*|
|使用Electron实现选中图像中mask部分|*未完成*|
|使用Electron实现选中图像mask部分并呈现对应病变信息|*未完成*|
|使用Electron实现图像漫游功能|已完成|
|使用Electron实现图像放大缩小功能|已完成|
|修改原图片描述标签css样式，保证文字不会超长|
|修改图片div内部垂直居中|已完成|
|使用object-position样式来实现移动图片功能,参考肖聊天记录|已完成|
|2020-1-15-编写鼠标响应横向滚动代码|*未完成*|
|2020-1-15-调通python与nodejs交互代码|*未完成*|


## 使用Python完成皮肤镜图像分割

实现功能请参考[seg_predict_task1.py](https://github.com/413180794/ISIC2018/blob/master/runs/seg_predict_task1.py)方法

输入:

![task1输入图像](https://github.com/413180794/schoolproject/blob/master/mark_image/task1_input.jpg)

输出:

![task1输出图像](https://github.com/413180794/schoolproject/blob/master/mark_image/task1_result.png)

## 使用Python完成皮肤镜图像属性检测

实现功能请参考[seg_predict_task2.py](https://github.com/413180794/ISIC2018/blob/master/runs/seg_predict_task2.py)方法

输入:

![task2输入图像](https://github.com/413180794/schoolproject/blob/master/mark_image/task2_input.jpg)

输出:

streaks
![task2输出图像](https://github.com/413180794/schoolproject/blob/master/mark_image/task2_result_attribute_streaks.png)

globule

![task2输出图像](https://github.com/413180794/schoolproject/blob/master/mark_image/task2_result_globule.png)

milia_like_cyst

![task2输出图像](https://github.com/413180794/schoolproject/blob/master/mark_image/task2_result_milia_like_cyst.png)

negative_network

![task2输出图像](https://github.com/413180794/schoolproject/blob/master/mark_image/task2_result_negative_network.png)

pgment_network


![task2输出图像](https://github.com/413180794/schoolproject/blob/master/mark_image/task2_result_pigment_network.png)

## 使用python完成基于mask图像对图像染色

这一步是对*使用Python完成皮肤镜图像属性检测*输出结果的进一步加工处理,具体实现[seg_predict_task2.py](https://github.com/413180794/ISIC2018/blob/master/runs/seg_predict_task2.py)方法见

```python
def put_predict_image(origin_image_np, test_mask, attr, alpha):
    '''
    将predict图片以apha透明度覆盖到origin图片中
    :param origin_image:
    :param predict_image:
    :param RGB:
    :param alpha:
    :return:
    '''
    test_mask_RGB = Image.fromarray(test_mask.astype('uint8')).convert("RGB") # 将原始二值化图像转换成RGB

    test_mask_np = np.asarray(test_mask_RGB,dtype=np.int) # 将二值化图像转换成三维数组
    height, width, channels = test_mask_np.shape  # 获得图片的三个纬度
    # 转换预测图像的颜色
    origin_image_np.flags.writeable=True
    test_mask_np.flags.writeable = True
    for row in range(height):
        for col in range(width):
            # 上色
            if test_mask_np[row, col, 0] == 255 and test_mask_np[row, col, 1] == 255 and test_mask_np[row, col, 2] == 255:
                test_mask_np[row, col, 0] = attr_colors[attr][0]
                test_mask_np[row, col, 1] = attr_colors[attr][1]
                test_mask_np[row, col, 2] = attr_colors[attr][2]

            if test_mask_np[row, col, 0] != 0 or test_mask_np[row,col, 1] != 0 or test_mask_np[row, col, 2] != 0:
                origin_image_np[row,col,0] = alpha*origin_image_np[row,col,0] + (1-alpha)*test_mask_np[row, col, 0]
                origin_image_np[row,col,1] = alpha*origin_image_np[row,col,1] + (1-alpha)*test_mask_np[row, col, 1]
                origin_image_np[row,col,2] = alpha*origin_image_np[row,col,2] + (1-alpha)*test_mask_np[row, col, 2]
    return origin_image_np 
```

输出图像

![task2输出图像](https://github.com/413180794/schoolproject/blob/master/mark_image/task2_result.png)

### 使用Python完成皮肤镜图像识别 

具体实现参考[cls_predict_task3.py](https://github.com/413180794/ISIC2018/blob/master/runs/cls_predict_task3.py)方法

输入对应的图像(略),将会输出以下结果

```shell script
image,MEL,NV,BCC,AKIEC,BKL,DF,VASC

[[1.23411750e-12 1.00000000e+00 1.45125067e-13 1.45125067e-13
  1.97942474e-13 1.53896815e-13 1.45125067e-13]]

Process finished with exit code 0
```
