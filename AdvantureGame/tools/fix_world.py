# -*- coding: utf-8 -*-
"""修复 world.js 结构：委托板函数并入 world 对象，移除孤儿代码"""
p = 'js/world.js'
src = open(p, encoding='utf-8').read()

# enterMap 方法结尾
i1 = src.index('    enterMap(mapId, x, y) {')
i2 = src.index('},', i1) + 3
head = src[:i2]

# 委托板函数块（从小游戏锚点倒推）
b1 = src.index('  /* ---------------- 委托板 + 讨伐悬赏')
b2 = src.index('  /* ============================================================')
board_funcs = src[b1:b2]
if not board_funcs.endswith('\n\n'):
    board_funcs = board_funcs.rstrip() + '\n\n'

# 小游戏区之后的内容
tail = src[b2:]

new = head + '\n' + board_funcs + '  };\n\n' + tail
open(p, 'w', encoding='utf-8').write(new)
print('repaired, len =', len(new))
