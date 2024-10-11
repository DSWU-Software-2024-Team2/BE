// description : 장바구니 관련 라우터
const express = require('express');
const router = express.Router();
const {
    getCartItems,
    addCartItem,
    deleteActiveCartItems,
    clearCart,
    toggleCartItemActive,
} = require('../controllers/cartController'); 

// 01. 장바구니 목록 조회 및 활성화된 아이템의 총 마일리지 계산
router.get('/items', getCartItems); 

// 02. 장바구니에 아이템 추가
router.post('/items', addCartItem); 

// 03. 장바구니 특정 아이템 삭제
router.delete('/items', deleteActiveCartItems); 

// 04. 장바구니 전체 비우기
router.delete('/items/clear', clearCart); 

// 05. 장바구니 아이템 활성화/비활성화 토글
router.patch('/items/toggle', toggleCartItemActive); 

module.exports = router; 