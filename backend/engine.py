"""Deterministic KRW accounting engine. No LLM participates in calculations."""
from collections import Counter, defaultdict
from datetime import date, datetime
from decimal import Decimal, InvalidOperation
import re

SALES = ['거래ID','주문번호','매출인식일','매출월','고객ID','제품코드','수량','할인전단가_KRW','할인율','기록매출액_KRW','배송비_KRW','사양변경비_KRW','통화']
COSTS = ['기준월','제품코드','재료비_KRW','노무비_KRW','외주가공비_KRW','제조간접비_KRW','표준단위원가_KRW']
PRODUCTS = ['제품코드','제품명','제품군','기본판매단가_KRW']
CUSTOMERS = ['고객ID','고객명','지역','산업','기본할인율']
SCHEMA = {'매출_정상':SALES,'원가_정상':COSTS,'제품마스터':PRODUCTS,'고객마스터':CUSTOMERS}

def number(v):
    if isinstance(v, bool) or v is None or v == '': raise ValueError('숫자 필수')
    try: d = Decimal(str(v))
    except InvalidOperation: raise ValueError('잘못된 숫자')
    if not d.is_finite(): raise ValueError('유한한 숫자 필수')
    return d

def valid_month(v):
    return isinstance(v,str) and bool(re.fullmatch(r'\d{4}-(0[1-9]|1[0-2])',v))

def validate(book, sales_sheet='매출_정상', cost_sheet='원가_정상'):
    errors=[]
    def err(sheet,row,field,value,msg,kind='INVALID_VALUE'):
        errors.append(dict(sheet=sheet,row=row,field=field,current_value=str(value) if value is not None else '빈 값',message=msg,error_type=kind,severity='높음'))
    schemas={sales_sheet:SALES,cost_sheet:COSTS,'제품마스터':PRODUCTS,'고객마스터':CUSTOMERS}
    for sheet,fields in schemas.items():
        if sheet not in book:
            err(sheet,1,'시트',None,'필수 시트를 추가해 주세요.','MISSING_SHEET'); continue
        if not book[sheet]: err(sheet,2,'데이터',None,'데이터 행이 필요합니다.','EMPTY_SHEET')
        for field in fields:
            if book[sheet] and field not in book[sheet][0]: err(sheet,1,field,None,'필수 컬럼을 추가해 주세요.','MISSING_COLUMN')
    products={str(r.get('제품코드')):r for r in book.get('제품마스터',[])}
    customers={str(r.get('고객ID')):r for r in book.get('고객마스터',[])}
    for sheet,key in [('제품마스터','제품코드'),('고객마스터','고객ID')]:
        counts=Counter(str(r.get(key)) for r in book.get(sheet,[]))
        for i,r in enumerate(book.get(sheet,[]),2):
            for f in schemas[sheet]:
                if r.get(f) in (None,''): err(sheet,i,f,r.get(f),'필수값을 입력해 주세요.','REQUIRED')
            if counts[str(r.get(key))]>1: err(sheet,i,key,r.get(key),'마스터 ID는 고유해야 합니다.','DUPLICATE_MASTER')
            f='기본판매단가_KRW' if sheet=='제품마스터' else '기본할인율'
            try:
                n=number(r.get(f))
                if (n<=0 if sheet=='제품마스터' else not 0<=n<1): raise ValueError()
            except ValueError: err(sheet,i,f,r.get(f),'단가는 양수, 할인율은 0 이상 1 미만이어야 합니다.')
    costs={}
    cost_counts=Counter((r.get('기준월'),r.get('제품코드')) for r in book.get(cost_sheet,[]))
    for i,r in enumerate(book.get(cost_sheet,[]),2):
        key=(r.get('기준월'),r.get('제품코드'))
        if not valid_month(key[0]): err(cost_sheet,i,'기준월',key[0],'YYYY-MM 형식으로 입력해 주세요.')
        if str(key[1]) not in products: err(cost_sheet,i,'제품코드',key[1],'제품마스터에 등록된 코드를 사용하세요.','UNKNOWN_PRODUCT')
        if cost_counts[key]>1: err(cost_sheet,i,'제품코드',key[1],'기준월·제품별 원가는 한 건이어야 합니다.','DUPLICATE_COST')
        ns={}
        for f in COSTS[2:]:
            try:
                ns[f]=number(r.get(f))
                if ns[f]<0 or (f==COSTS[-1] and ns[f]==0): raise ValueError()
            except ValueError: err(cost_sheet,i,f,r.get(f),'0 이상의 원가(표준원가는 양수)를 입력하세요.')
        if len(ns)==5 and sum(ns[f] for f in COSTS[2:6])!=ns[COSTS[-1]]: err(cost_sheet,i,COSTS[-1],r.get(COSTS[-1]),'구성 원가 합계와 일치하도록 수정하세요.','COST_MISMATCH')
        costs[key]=r
    counts=Counter(r.get('거래ID') for r in book.get(sales_sheet,[]))
    for i,r in enumerate(book.get(sales_sheet,[]),2):
        for f in SALES:
            if r.get(f) in (None,''): err(sales_sheet,i,f,r.get(f),'필수값을 입력해 주세요.','REQUIRED')
        if counts[r.get('거래ID')]>1: err(sales_sheet,i,'거래ID',r.get('거래ID'),'중복 거래ID를 수정하세요.','DUPLICATE_TRANSACTION')
        for f,master,kind in [('고객ID',customers,'UNKNOWN_CUSTOMER'),('제품코드',products,'UNKNOWN_PRODUCT')]:
            if str(r.get(f)) not in master: err(sales_sheet,i,f,r.get(f),'마스터에 등록된 ID를 사용하세요.',kind)
        month=r.get('매출월')
        if not valid_month(month): err(sales_sheet,i,'매출월',month,'YYYY-MM 형식으로 입력해 주세요.')
        try:
            d=r.get('매출인식일')
            d=d.date() if isinstance(d,datetime) else d
            if not isinstance(d,date): d=date.fromisoformat(str(d))
            if d.strftime('%Y-%m')!=month: err(sales_sheet,i,'매출월',month,'매출인식일의 월과 일치해야 합니다.','MONTH_MISMATCH')
        except (ValueError,TypeError): err(sales_sheet,i,'매출인식일',r.get('매출인식일'),'실제 날짜를 YYYY-MM-DD로 입력하세요.','INVALID_DATE')
        if (month,r.get('제품코드')) not in costs: err(sales_sheet,i,'제품코드',r.get('제품코드'),'해당 매출월의 제품 원가를 등록하세요.','MISSING_COST')
        if r.get('통화')!='KRW': err(sales_sheet,i,'통화',r.get('통화'),'MVP는 KRW만 지원합니다.','UNSUPPORTED_CURRENCY')
        ns={}
        for f in SALES[6:12]:
            if r.get(f) in (None,''): continue
            try:
                n=number(r[f]); ns[f]=n
                if (f in SALES[6:8] and n<=0) or (f=='할인율' and not 0<=n<1) or (f in SALES[9:12] and n<0): raise ValueError()
            except ValueError: err(sales_sheet,i,f,r.get(f),'수량·단가는 양수, 할인율은 [0, 1), 비용·매출은 0 이상이어야 합니다.')
        if all(f in ns for f in SALES[6:10]):
            calc=ns['수량']*ns['할인전단가_KRW']*(1-ns['할인율'])
            if calc!=ns['기록매출액_KRW']: err(sales_sheet,i,'기록매출액_KRW',r.get('기록매출액_KRW'),f'계산 매출액 {calc:,.2f}원과 일치하도록 수정하세요.','REVENUE_MISMATCH')
    return dict(validation_status='failed' if errors else 'passed',error_count=len(errors),errors=errors)

def calculate(q,price,discount,cost,shipping,custom):
    q,price,discount,cost,shipping,custom=map(number,[q,price,discount,cost,shipping,custom])
    revenue=q*price*(1-discount); cogs=q*cost; gross=revenue-cogs; profit=gross-shipping-custom
    return dict(revenue=float(revenue),cogs=float(cogs),gross_profit=float(gross),adjusted_profit=float(profit),adjusted_margin=float(profit/revenue) if revenue else 0)

def analyze(book,period='',region='',family='',sales_sheet='매출_정상',cost_sheet='원가_정상'):
    checked=validate(book,sales_sheet,cost_sheet)
    if checked['error_count']: raise ValueError('검증 오류를 모두 수정한 후 분석할 수 있습니다.')
    products={str(r['제품코드']):r for r in book['제품마스터']}; customers={str(r['고객ID']):r for r in book['고객마스터']}
    costs={(r['기준월'],r['제품코드']):r for r in book[cost_sheet]}
    rows=[]
    for r in book[sales_sheet]:
        p=products[str(r['제품코드'])]; c=customers[str(r['고객ID'])]
        if not r['매출월'].startswith(period) or (region and c['지역']!=region) or (family and p['제품군']!=family): continue
        calc=calculate(r['수량'],r['할인전단가_KRW'],r['할인율'],costs[(r['매출월'],r['제품코드'])]['표준단위원가_KRW'],r['배송비_KRW'],r['사양변경비_KRW'])
        rows.append(dict(**calc,transaction_id=r['거래ID'],month=r['매출월'],product_code=r['제품코드'],product_name=p['제품명'],family=p['제품군'],customer_id=r['고객ID'],customer_name=c['고객명'],region=c['지역'],discount=float(r['할인율']),shipping=float(r['배송비_KRW']),custom=float(r['사양변경비_KRW'])))
    def total(rs):
        out={k:float(sum(Decimal(str(r[k])) for r in rs)) for k in ['revenue','cogs','gross_profit','adjusted_profit','shipping','custom']}
        out['adjusted_margin']=out['adjusted_profit']/out['revenue'] if out['revenue'] else 0
        out['avg_discount']=sum(r['discount'] for r in rs)/len(rs) if rs else 0
        out['count']=len(rs); return out
    def group(key,meta):
        groups=defaultdict(list)
        for r in rows: groups[r[key]].append(r)
        return [dict(id=k,**{f:rs[0][f] for f in meta},**total(rs)) for k,rs in sorted(groups.items())]
    return dict(**total(rows),by_product=group('product_code',['product_name','family']),by_customer=group('customer_id',['customer_name','region']),by_month=group('month',[]),transactions=rows,period=period or '전체 기간')

def demo_book():
    products=[dict(zip(PRODUCTS,r)) for r in [('BCR-A100','소형 로봇 액추에이터','Actuator',420000),('BCR-A200','고하중 로봇 액추에이터','Actuator',780000),('BCR-C100','다축 로봇 제어기','Controller',620000)]]
    customers=[dict(zip(CUSTOMERS,r)) for r in [('C001','동남정밀로보틱스','국내','제조',.03),('C004','한양오토메틱스','국내','제조',.085),('C009','Apex Robotics Inc.','해외','로봇',.12),('C017','Nordvik Automation','해외','자동화',.15)]]
    sales=[];costs=[]
    for m in range(1,13):
        month=f'2025-{m:02}'
        for j,p in enumerate(products):
            unit=[285000,575000,398000][j]+(m//7)*[6000,22000,5000][j]
            costs.append(dict(zip(COSTS,[month,p['제품코드'],unit-115000,42000,38000,35000,unit])))
            for k,c in enumerate(customers):
                q=35+m*4+j*12+k*3; price=p['기본판매단가_KRW']; dis=c['기본할인율']
                rev=float(Decimal(q)*Decimal(price)*(1-Decimal(str(dis))))
                sales.append(dict(zip(SALES,[f'TX{len(sales)+1:04}',f'ORD-{len(sales)+1:04}',month+'-15',month,c['고객ID'],p['제품코드'],q,price,dis,rev,260000 if k>1 else 35000,80000 if k==3 else 0,'KRW'])))
    return dict(zip(SCHEMA,[sales,costs,products,customers]))
