from copy import deepcopy
from decimal import Decimal
import pytest
from backend.engine import demo_book, validate, analyze, calculate


def test_demo_validates_and_aggregates():
    book=demo_book()
    assert validate(book)['error_count']==0
    result=analyze(book)
    assert result['count']==144
    assert sum(p['revenue'] for p in result['by_product'])==result['revenue']
    assert sum(p['adjusted_profit'] for p in result['by_customer'])==result['adjusted_profit']
    assert result['adjusted_profit']==result['gross_profit']-result['shipping']-result['custom']
    assert len(analyze(book,'2025-01','해외','Actuator')['transactions'])==4
    assert analyze(book,'2026')['adjusted_margin']==0


def test_spec_simulation_examples():
    expected=[(0,23400000,5890000),(.05,22230000,4720000),(.1,21060000,3550000)]
    for discount,revenue,profit in expected:
        result=calculate(30,780000,discount,575000,260000,0)
        assert result['revenue']==revenue
        assert result['adjusted_profit']==profit
        assert result['adjusted_margin']==pytest.approx(profit/revenue)


def test_twelve_independent_errors():
    book=demo_book(); sales=book['매출_정상']; costs=book['원가_정상']
    sales[0]['고객ID']='C999'
    sales[1]['수량']=None
    sales[2]['매출인식일']='2025-02-30'
    sales[3]['통화']='USD'
    sales[4]['배송비_KRW']=-1
    sales[5]['사양변경비_KRW']=-1
    sales[6]['기록매출액_KRW']+=1
    sales[7]['할인율']=1
    sales[7]['기록매출액_KRW']=0
    sales[8]['거래ID']=sales[9]['거래ID']
    costs[0]['표준단위원가_KRW']+=1
    costs[1]['재료비_KRW']+=1
    result=validate(book)
    assert result['error_count']==12
    with pytest.raises(ValueError): analyze(book)

@pytest.mark.parametrize('field,value,kind',[
    ('제품코드','BCR-X999','UNKNOWN_PRODUCT'),
    ('매출월','2025-13','MISSING_COST'),
    ('할인전단가_KRW','abc','INVALID_VALUE'),
    ('수량',float('inf'),'INVALID_VALUE'),
])
def test_bad_sales(field,value,kind):
    book=demo_book(); book['매출_정상'][0][field]=value
    assert kind in {e['error_type'] for e in validate(book)['errors']}


def test_missing_sheets_and_duplicate_costs_block_analysis():
    book=demo_book(); del book['제품마스터']
    assert validate(book)['validation_status']=='failed'
    book=demo_book(); book['원가_정상'].append(deepcopy(book['원가_정상'][0]))
    assert 'DUPLICATE_COST' in {e['error_type'] for e in validate(book)['errors']}


def test_decimal_calculation_no_binary_rounding_difference():
    assert calculate(3,100,.1,60,0,0)['revenue']==270
