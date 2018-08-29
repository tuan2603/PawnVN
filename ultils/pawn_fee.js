//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//:::                                                                         :::
//:::  tổng tiền lãi = giá đấu * lãi xuất * lãi 30 ngày(số ngày vay / 30)     :::
//:::  tiền pawn thu = tổng tiền lãi * 20% / số ngày vay/ kỳ hạn nộp lãi      :::
//:::                                                                         :::
//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

exports.pawn_fee = async function pawn_fee(gia_dau, lai_xuat, so_ngay_vay, ky_han_nop_lai) {
    let ttl = await (gia_dau * lai_xuat * (so_ngay_vay / 30));
    return (ttl * 0.2 / so_ngay_vay / ky_han_nop_lai);
}