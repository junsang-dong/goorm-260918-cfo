from io import BytesIO
import pytest
from fastapi.testclient import TestClient
from openpyxl import load_workbook
from backend import main

@pytest.fixture
def client(tmp_path,monkeypatch):
    monkeypatch.setattr(main,'ROOT',tmp_path)
    return TestClient(main.app)


def test_upload_validation_analysis_report_pipeline(client):
    template=client.get('/api/files/template')
    assert template.status_code==200
    upload=client.post('/api/files/upload',files={'file':('sample.xlsx',template.content)})
    assert upload.status_code==200
    file_id=upload.json()['file_id']
    assert len(upload.json()['sheets'])==4
    selection={'file_id':file_id}
    assert client.post('/api/validation/run',json=selection).json()['error_count']==0
    analyzed=client.post('/api/profit/analyze',json=selection).json()
    assert analyzed['count']==144
    report=client.post('/api/ai/report',json={'analysis_id':analyzed['analysis_id']}).json()
    assert f"{analyzed['revenue']:,.0f}" in report['executive_summary']
    assert report['mode']=='rule_based'
    assert client.get('/api/files').json()[0]['file_id']==file_id
    # Persisted data can be read by a separate client/session.
    assert TestClient(main.app).post('/api/profit/analyze',json=selection).status_code==200


def test_invalid_workbook_cannot_be_analyzed(client):
    raw=client.get('/api/files/template').content
    wb=load_workbook(BytesIO(raw)); wb['매출_정상']['E2']='C999'
    buf=BytesIO();wb.save(buf)
    f=client.post('/api/files/upload',files={'file':('invalid.xlsx',buf.getvalue())}).json()
    selection={'file_id':f['file_id']}
    assert client.post('/api/validation/run',json=selection).json()['error_count']==1
    assert client.post('/api/profit/analyze',json=selection).status_code==422


def test_bad_files_and_missing_records(client):
    assert client.post('/api/files/upload',files={'file':('x.xlsx',b'bad')}).status_code==400
    assert client.post('/api/files/upload',files={'file':('x.csv',b'bad')}).status_code==400
    assert client.post('/api/profit/analyze',json={'file_id':'missing'}).status_code==404


def test_simulation_input_and_result(client):
    req=dict(product_code='BCR-A200',customer_id='C017',quantity=30,cost_month='2025-01',shipping_cost=260000,discount_rates=[0,.05,.1])
    result=client.post('/api/simulation/discount',json=req)
    assert result.status_code==200
    assert result.json()['results'][2]['adjusted_profit']==3550000
    req['discount_rates']=[1]
    assert client.post('/api/simulation/discount',json=req).status_code==422
    req['discount_rates']=[0];req['quantity']=-1
    assert client.post('/api/simulation/discount',json=req).status_code==422
