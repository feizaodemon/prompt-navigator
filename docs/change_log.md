# Change Log

## V2E-V2G

- V2E: Search panel layering fixes
  - 修复搜索面板层级问题，确保面板按钮保持最高层级且可点击。
- V2F: Long-answer navigation accuracy
  - 改进长回答场景下的 prompt 定位准确性，保留基于 `originalIndex` 的目标重解析。
- V2G: Direct scroll without reverse jump
  - 移除点击跳转中的 `scrollIntoView()` 与手动校准混用，改为统一手动滚动计算。
  - 为二次校准增加像素阈值和最大次数，减少“先向上滚动再跳回来”的视觉路径。
